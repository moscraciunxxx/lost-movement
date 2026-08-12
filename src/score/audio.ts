import type { Family, Measure } from "./types.ts";

const ROOT = 146.83;

const FAMILY_VOICE: Record<
  Family,
  { type: OscillatorType; semi: number; filter: number; decay: number }
> = {
  strings: { type: "sawtooth", semi: 0, filter: 1600, decay: 0.92 },
  woodwinds: { type: "triangle", semi: 7, filter: 2100, decay: 0.78 },
  brass: { type: "square", semi: 12, filter: 1200, decay: 0.7 },
  percussion: { type: "square", semi: -12, filter: 700, decay: 0.18 },
};

function midiToHz(semi: number): number {
  return ROOT * Math.pow(2, semi / 12);
}

export class HallAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  async resume(): Promise<void> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2600;
      filter.Q.value = 0.7;

      const delay = this.ctx.createDelay(0.4);
      delay.delayTime.value = 0.19;
      const wet = this.ctx.createGain();
      wet.gain.value = 0.11;

      this.master.connect(filter);
      filter.connect(this.ctx.destination);
      filter.connect(delay);
      delay.connect(wet);
      wet.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  get currentTime(): number {
    return this.ctx?.currentTime ?? 0;
  }

  playMeasure(measure: Measure, when = 0, duration = 0.55): void {
    if (!this.ctx || !this.master || measure.loudness <= 0) return;
    const start = Math.max(this.ctx.currentTime, when);
    const amp = 0.03 + measure.loudness * 0.16;

    for (const family of Object.keys(FAMILY_VOICE) as Family[]) {
      const weight = measure.families[family];
      if (weight < 0.06) continue;
      const voice = FAMILY_VOICE[family];
      this.tone(
        midiToHz(voice.semi),
        start,
        duration * voice.decay,
        amp * Math.max(0.18, weight),
        voice,
      );
    }

    if (measure.conflicted || measure.tension >= 0.8) {
      this.tone(midiToHz(1), start, duration * 0.62, amp * 0.42, FAMILY_VOICE.brass);
    } else if (measure.isMerge) {
      this.tone(midiToHz(7), start, duration * 0.4, amp * 0.28, FAMILY_VOICE.strings);
      this.tone(midiToHz(0), start + duration * 0.38, duration * 0.52, amp * 0.26, FAMILY_VOICE.strings);
    } else if (measure.tension >= 0.35) {
      this.tone(midiToHz(6), start, duration * 0.5, amp * 0.22, FAMILY_VOICE.woodwinds);
    } else {
      this.tone(midiToHz(7), start, duration * 0.85, amp * 0.16, FAMILY_VOICE.strings);
    }
  }

  private tone(
    freq: number,
    start: number,
    duration: number,
    gain: number,
    voice: { type: OscillatorType; filter: number },
  ): void {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = voice.type;
    osc.frequency.setValueAtTime(freq, start);
    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0008, gain), start + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0008, start + Math.max(0.06, duration));
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(voice.filter, start);
    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  stop(): void {
    void this.ctx?.suspend();
  }
}
