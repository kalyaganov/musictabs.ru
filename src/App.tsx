import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

const KEYS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const
const SCALES = {
  minor: { label: 'Минор', intervals: [0, 2, 3, 5, 7, 8, 10] },
  major: { label: 'Мажор', intervals: [0, 2, 4, 5, 7, 9, 11] },
  pentatonic: { label: 'Пентатоника', intervals: [0, 3, 5, 7, 10] },
} as const
const GENRES = ['Indie', 'Rock', 'Blues', 'Ambient'] as const
const GUITAR_SOUNDS = {
  clean: 'Чистый',
  nylon: 'Нейлон',
  drive: 'Drive',
} as const
const THEMES = {
  studio: 'Студия',
  paper: 'Бумага',
  night: 'Ночь',
} as const
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'] as const
const STRING_MIDI = [64, 59, 55, 50, 45, 40] as const

type Key = (typeof KEYS)[number]
type Scale = keyof typeof SCALES
type Genre = (typeof GENRES)[number]
type GuitarSound = keyof typeof GUITAR_SOUNDS
type Theme = keyof typeof THEMES

interface Settings {
  key: Key
  scale: Scale
  genre: Genre
  sound: GuitarSound
  volume: number
  tempo: number
  bars: number
  complexity: number
}

interface TabNote {
  fret: number
  midi: number
  note: string
  stringIndex: number
}

interface GeneratedRiff {
  id: number
  name: string
  notes: TabNote[]
}

const noteName = (midi: number): string => {
  const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`
}

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!

function generateRiff(settings: Settings): GeneratedRiff {
  const root = KEYS.indexOf(settings.key)
  const scaleNotes = new Set(SCALES[settings.scale].intervals.map((interval) => (root + interval) % 12))
  const maxFret = 5 + settings.complexity * 3
  const candidates: TabNote[] = []

  STRING_MIDI.forEach((openMidi, stringIndex) => {
    for (let fret = 0; fret <= maxFret; fret += 1) {
      const midi = openMidi + fret
      if (scaleNotes.has(midi % 12) && midi >= 45 && midi <= 76) {
        candidates.push({ fret, midi, note: noteName(midi), stringIndex })
      }
    }
  })

  const length = settings.bars * 8
  const rootCandidates = candidates.filter((candidate) => candidate.midi % 12 === root)
  const notes: TabNote[] = []
  let previous = pick(rootCandidates.length > 0 ? rootCandidates : candidates)

  for (let index = 0; index < length; index += 1) {
    const isPhraseEnd = index > 0 && (index + 1) % 8 === 0
    const pool = isPhraseEnd
      ? rootCandidates
      : candidates.filter((candidate) => Math.abs(candidate.midi - previous.midi) <= 4 + settings.complexity * 2)
    previous = pick(pool.length > 0 ? pool : candidates)
    notes.push(previous)
  }

  const words: Record<Genre, readonly string[]> = {
    Indie: ['Velvet', 'Paper', 'Neon'],
    Rock: ['Electric', 'Wild', 'Chrome'],
    Blues: ['Smoky', 'Midnight', 'Slow'],
    Ambient: ['Distant', 'Glass', 'Soft'],
  }

  return {
    id: Date.now(),
    name: `${pick(words[settings.genre])} ${settings.genre} · ${settings.key} ${SCALES[settings.scale].label.toLowerCase()}`,
    notes,
  }
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('musictabs-theme')
    return savedTheme && savedTheme in THEMES ? savedTheme as Theme : 'paper'
  })
  const [settings, setSettings] = useState<Settings>({
    key: 'A',
    scale: 'minor',
    genre: 'Indie',
    sound: 'clean',
    volume: 70,
    tempo: 96,
    bars: 4,
    complexity: 2,
  })
  const [riff, setRiff] = useState<GeneratedRiff>(() => generateRiff({
    key: 'A', scale: 'minor', genre: 'Indie', sound: 'clean', volume: 70, tempo: 96, bars: 4, complexity: 2,
  }))
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef<Tone.PluckSynth | null>(null)
  const synthSoundRef = useRef<GuitarSound | null>(null)
  const distortionRef = useRef<Tone.Distortion | null>(null)
  const kickRef = useRef<Tone.MembraneSynth | null>(null)
  const snareRef = useRef<Tone.NoiseSynth | null>(null)
  const hatRef = useRef<Tone.MetalSynth | null>(null)
  const tabCardRef = useRef<HTMLDivElement | null>(null)
  const stepCounterRef = useRef<HTMLSpanElement | null>(null)
  const stepPulseRef = useRef<HTMLSpanElement | null>(null)
  const playbackIdRef = useRef(0)

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  // Updating the whole tab for every eighth note makes long riffs stutter,
  // especially after the audio engine has already played a few riffs. Keep this
  // small, time-critical bit of UI outside React's render loop instead.
  const setPlaybackStep = useCallback((step: number | null, totalSteps: number) => {
    const tabCard = tabCardRef.current
    if (tabCard) {
      tabCard.querySelectorAll('.tab-cell.active').forEach((cell) => cell.classList.remove('active'))
      if (step !== null) {
        tabCard.querySelectorAll(`[data-step="${step}"]`).forEach((cell) => cell.classList.add('active'))
      }
    }
    if (stepCounterRef.current) {
      stepCounterRef.current.textContent = step === null ? 'Готов к проигрыванию' : `Нота ${step + 1} из ${totalSteps}`
    }
    stepPulseRef.current?.classList.toggle('pulse', step !== null)
  }, [])

  const stopPlayback = useCallback(() => {
    playbackIdRef.current += 1
    const transport = Tone.getTransport()
    transport.stop()
    transport.cancel(0)
    Tone.getDraw().cancel(0)
    transport.position = 0
    synthRef.current?.triggerRelease()
    setPlaybackStep(null, 0)
    setIsPlaying(false)
  }, [setPlaybackStep])

  const playRiff = useCallback(async () => {
    await Tone.start()
    const playbackId = ++playbackIdRef.current
    const transport = Tone.getTransport()
    transport.stop()
    transport.cancel(0)
    Tone.getDraw().cancel(0)
    transport.position = 0
    setPlaybackStep(null, riff.notes.length)

    if (!synthRef.current || synthSoundRef.current !== settings.sound) {
      synthRef.current?.dispose()
      distortionRef.current?.dispose()
      distortionRef.current = null
      const guitarPresets = {
        clean: { attackNoise: 0.7, dampening: 4200, resonance: 0.78 },
        nylon: { attackNoise: 0.35, dampening: 2700, resonance: 0.92 },
        drive: { attackNoise: 1.5, dampening: 1800, resonance: 0.55 },
      }
      synthRef.current = new Tone.PluckSynth(guitarPresets[settings.sound])
      synthSoundRef.current = settings.sound
      if (settings.sound === 'drive') {
        distortionRef.current = new Tone.Distortion(0.32).toDestination()
        synthRef.current.connect(distortionRef.current)
      } else {
        synthRef.current.toDestination()
      }
    }
    if (!kickRef.current) {
      kickRef.current = new Tone.MembraneSynth({ pitchDecay: 0.04, octaves: 4 }).toDestination()
      snareRef.current = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.002, decay: 0.11, sustain: 0 },
      }).toDestination()
      hatRef.current = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.04, release: 0.02 },
        harmonicity: 5.1,
        modulationIndex: 24,
        resonance: 2500,
        octaves: 1.5,
      }).toDestination()
      hatRef.current.volume.value = -14
      snareRef.current.volume.value = -8
    }

    const guitar = synthRef.current
    const kick = kickRef.current
    const snare = snareRef.current
    const hat = hatRef.current
    const draw = Tone.getDraw()
    draw.anticipation = 0.03

    // Schedule every hit before starting the transport. Capturing the current audio
    // nodes and guarding the playback id prevents callbacks from a stopped riff from
    // reaching a later one.
    const beatSeconds = 60 / settings.tempo
    const stepSeconds = beatSeconds / 2
    riff.notes.forEach((tabNote, index) => {
      const time = index * stepSeconds
      transport.schedule((scheduledTime) => {
        if (playbackId !== playbackIdRef.current) return
        guitar?.triggerAttack(tabNote.note, scheduledTime)
        draw.schedule(() => {
          if (playbackId === playbackIdRef.current) setPlaybackStep(index, riff.notes.length)
        }, scheduledTime)
      }, time)
    })

    for (let beat = 0; beat < settings.bars * 4; beat += 1) {
      const time = beat * beatSeconds
      if (beat % 4 === 0 || beat % 4 === 2) {
        transport.schedule((scheduledTime) => {
          if (playbackId === playbackIdRef.current) kick?.triggerAttackRelease('C1', '8n', scheduledTime)
        }, time)
      }
      if (beat % 4 === 1 || beat % 4 === 3) {
        transport.schedule((scheduledTime) => {
          if (playbackId === playbackIdRef.current) snare?.triggerAttackRelease('16n', scheduledTime)
        }, time)
      }
      transport.schedule((scheduledTime) => {
        if (playbackId === playbackIdRef.current) hat?.triggerAttackRelease('16n', scheduledTime)
      }, time)
      transport.schedule((scheduledTime) => {
        if (playbackId === playbackIdRef.current) hat?.triggerAttackRelease('16n', scheduledTime)
      }, time + stepSeconds)
    }

    const finishAt = riff.notes.length * stepSeconds + 0.1
    transport.schedule((scheduledTime) => {
      if (playbackId !== playbackIdRef.current) return
      draw.schedule(() => {
        if (playbackId !== playbackIdRef.current) return
        setPlaybackStep(null, riff.notes.length)
        setIsPlaying(false)
      }, scheduledTime)
    }, finishAt)
    setIsPlaying(true)
    transport.start('+0.12')
  }, [riff.notes, setPlaybackStep, settings.bars, settings.sound, settings.tempo])

  const onGenerate = () => {
    stopPlayback()
    setRiff(generateRiff(settings))
  }

  const onSoundChange = (sound: GuitarSound) => {
    if (isPlaying) stopPlayback()
    updateSetting('sound', sound)
  }

  useEffect(() => {
    Tone.getDestination().volume.value = settings.volume === 0 ? -60 : Tone.gainToDb(settings.volume / 100)
  }, [settings.volume])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('musictabs-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'paper' ? '#f1ecdf' : '#101315')
  }, [theme])

  useEffect(() => () => {
    playbackIdRef.current += 1
    Tone.getTransport().stop()
    Tone.getTransport().cancel(0)
    Tone.getDraw().cancel(0)
    synthRef.current?.dispose()
    distortionRef.current?.dispose()
    kickRef.current?.dispose()
    snareRef.current?.dispose()
    hatRef.current?.dispose()
  }, [])

  const totalSteps = riff.notes.length
  const stepsPerRow = 32
  const tabRows = Array.from({ length: Math.ceil(totalSteps / stepsPerRow) }, (_, rowIndex) => {
    const start = rowIndex * stepsPerRow
    return { notes: riff.notes.slice(start, start + stepsPerRow), start }
  })

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="MusicTabs, на главную">
          <span className="brand-mark">MT</span>
          <span>MUSIC TABS</span>
        </a>
        <div className="header-tools">
          <span className="header-note"><i /> генератор гитарных мелодий</span>
          <div className="theme-switcher" aria-label="Тема оформления">
            {(Object.entries(THEMES) as [Theme, string][]).map(([value, label]) => (
              <button key={value} className={theme === value ? 'selected' : ''} onClick={() => setTheme(value)} aria-pressed={theme === value}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <h1>Собери мелодию.<br /><em>Сыграй её сразу.</em></h1>
      </section>

      <section className="forge" aria-label="Генератор риффа">
        <aside className="controls">
          <div className="panel-heading">
            <span>01</span>
            <h2>Настрой рифф</h2>
          </div>

          <label className="control-label" htmlFor="key">Тональность</label>
          <div className="key-grid" id="key">
            {KEYS.map((key) => <button key={key} className={settings.key === key ? 'selected' : ''} onClick={() => updateSetting('key', key)}>{key}</button>)}
          </div>

          <label className="control-label" htmlFor="scale">Лад</label>
          <div className="choice-group" id="scale">
            {(Object.entries(SCALES) as [Scale, (typeof SCALES)[Scale]][]).map(([value, scale]) => (
              <button key={value} className={settings.scale === value ? 'selected' : ''} onClick={() => updateSetting('scale', value)}>{scale.label}</button>
            ))}
          </div>

          <label className="control-label" htmlFor="genre">Характер</label>
          <div className="choice-group genre-group" id="genre">
            {GENRES.map((genre) => <button key={genre} className={settings.genre === genre ? 'selected' : ''} onClick={() => updateSetting('genre', genre)}>{genre}</button>)}
          </div>

          <div className="range-head"><label htmlFor="complexity">Сложность</label><strong>{['Просто', 'Свободно', 'Смело', 'Технично'][settings.complexity - 1]}</strong></div>
          <input id="complexity" type="range" min="1" max="4" value={settings.complexity} onChange={(event) => updateSetting('complexity', Number(event.target.value))} />

          <div className="range-head"><label htmlFor="bars">Длина</label><strong>{settings.bars} такта</strong></div>
          <input id="bars" type="range" min="2" max="8" step="2" value={settings.bars} onChange={(event) => updateSetting('bars', Number(event.target.value))} />

          <button className="generate-button" onClick={onGenerate}>
            <span>✦</span> Сгенерировать
          </button>
        </aside>

        <section className="result-panel">
          <div className="result-topline">
            <div>
              <p className="eyebrow">02 · Играй рифф</p>
              <h2>{riff.name}</h2>
            </div>
            <div className="metadata"><span>{settings.bars}/4</span><span>{settings.tempo} BPM</span></div>
          </div>

          <div className="tab-card" ref={tabCardRef} role="img" aria-label="Сгенерированная гитарная табулатура">
            {tabRows.map(({ notes, start }, rowIndex) => (
              <div className="tab-row" key={`${riff.id}-${start}`}>
                <div className="tab-ruler" style={{ gridTemplateColumns: `repeat(${notes.length / 8}, 1fr)` }}>
                  {Array.from({ length: notes.length / 8 }, (_, index) => <span key={index}>ТАКТ {rowIndex * 4 + index + 1}</span>)}
                </div>
                <div className="tab-lines">
                  {STRING_NAMES.map((name, stringIndex) => (
                    <div className="tab-line" key={name}>
                      <span className="string-label">{name}</span>
                      <div className="string-cells" style={{ gridTemplateColumns: `repeat(${notes.length}, minmax(15px, 1fr))` }}>
                        {notes.map((tabNote, index) => {
                          const step = start + index
                          return <span key={`${riff.id}-${stringIndex}-${step}`} data-step={step} className={`tab-cell ${tabNote.stringIndex === stringIndex ? 'has-note' : ''} ${(index + 1) % 8 === 0 ? 'bar-end' : ''}`}>
                            {tabNote.stringIndex === stringIndex ? tabNote.fret : '—'}
                          </span>
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="player">
            <button className={`play-button ${isPlaying ? 'playing' : ''}`} onClick={isPlaying ? stopPlayback : playRiff} aria-label={isPlaying ? 'Остановить проигрывание' : 'Проиграть рифф'}>
              {isPlaying ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" /></svg>}
            </button>
            <div className="player-copy"><strong>{isPlaying ? 'Играет с ударными' : 'Нажми, чтобы услышать'}</strong><span>{GUITAR_SOUNDS[settings.sound]} · барабаны · {settings.tempo} BPM</span></div>
            <div className="sound-control">
              <span>Звук</span>
              <div>
                {(Object.entries(GUITAR_SOUNDS) as [GuitarSound, string][]).map(([sound, label]) => (
                  <button key={sound} className={settings.sound === sound ? 'selected' : ''} onClick={() => onSoundChange(sound)}>{label}</button>
                ))}
              </div>
            </div>
            <div className="tempo-control">
              <label htmlFor="tempo">Темп</label>
              <div><input id="tempo" type="range" min="60" max="180" value={settings.tempo} onChange={(event) => updateSetting('tempo', Number(event.target.value))} /><output>{settings.tempo}</output></div>
            </div>
            <div className="tempo-control volume-control">
              <label htmlFor="volume">Громкость</label>
              <div><input id="volume" type="range" min="0" max="100" value={settings.volume} onChange={(event) => updateSetting('volume', Number(event.target.value))} /><output>{settings.volume}%</output></div>
            </div>
          </div>
          <div className="step-counter"><span className="step-indicator" ref={stepPulseRef} /> <span ref={stepCounterRef}>Готов к проигрыванию</span></div>
        </section>
      </section>

      <footer><span>MUSIC TABS</span><p>Создано для момента, когда хочется взять гитару.</p></footer>
    </main>
  )
}

export default App
