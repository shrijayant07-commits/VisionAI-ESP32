export const TAMIL_TRANSLATIONS = {
  person:       'நபர்',
  bicycle:      'மிதிவண்டி',
  car:          'கார்',
  motorcycle:   'மோட்டார் சைக்கிள்',
  airplane:     'விமானம்',
  bus:          'பேருந்து',
  train:        'ரயில்',
  truck:        'லாரி',
  boat:         'படகு',
  bottle:       'பாட்டில்',
  chair:        'நாற்காலி',
  couch:        'சோஃபா',
  'cell phone': 'செல்போன்',
  phone:        'தொலைபேசி',
  laptop:       'லேப்டாப்',
  book:         'புத்தகம்',
  cup:          'கோப்பை',
  dog:          'நாய்',
  cat:          'பூனை',
  bird:         'பறவை',
  keyboard:     'விசைப்பலகை',
  mouse:        'சுட்டி',
  clock:        'கடிகாரம்',
  tv:           'தொலைக்காட்சி',
  remote:       'ரிமோட்',
  bag:          'பை',
  backpack:     'முதுகுப்பை',
  umbrella:     'குடை',
  glasses:      'கண்ணாடி',
  face:         'முகம்',
  bed:          'கட்டில்',
  toilet:       'கழிப்பறை',
  sink:         'தொட்டி',
  refrigerator: 'குளிர்சாதனப் பெட்டி',
  microwave:    'மைக்ரோவேவ்',
  oven:         'அடுப்பு',
  'dining table': 'சாப்பாட்டு மேசை',
  vase:         'பூச்சட்டி',
  scissors:     'கத்தரிக்கோல்',
  toothbrush:   'பல் துலக்கி',
  apple:        'ஆப்பிள்',
  orange:       'ஆரஞ்சு',
  banana:       'வாழைப்பழம்',
  pizza:        'பிட்சா',
  cake:         'கேக்',
  sandwich:     'சாண்ட்விட்ச்',
  sports:       'விளையாட்டு',
  ball:         'பந்து',
  kite:         'பட்டம்',
}

export function buildTamilPhrase(objectClass) {
  const key = objectClass.toLowerCase()
  const tamilWord = TAMIL_TRANSLATIONS[key]

  if (!tamilWord) {
    return `${objectClass} கண்டறியப்பட்டது.`
  }

  if (key === 'person') return `ஒரு ${tamilWord} கண்டறியப்பட்டார்.`

  return `${tamilWord} கண்டறியப்பட்டது.`
}

export const TAMIL_SYSTEM_PHRASES = {
  cameraConnected:    'கேமரா வெற்றிகரமாக இணைக்கப்பட்டது.',
  cameraDisconnected: 'கேமரா துண்டிக்கப்பட்டது.',
  detectionStarted:   'AI கண்டறிதல் தொடங்கப்பட்டது.',
  detectionStopped:   'AI கண்டறிதல் நிறுத்தப்பட்டது.',
  faceDetected:       'முகம் கண்டறியப்பட்டது.',
  noFace:             'முகம் இல்லை.',
  modelReady:         'AI மாடல் தயாராக உள்ளது.',
  testVoice:          'வணக்கம். VisionAI செயல்படுகிறது.',
}

export const ENGLISH_SYSTEM_PHRASES = {
  cameraConnected:    'Camera connected successfully.',
  cameraDisconnected: 'Camera disconnected.',
  detectionStarted:   'AI detection started.',
  detectionStopped:   'AI detection stopped.',
  faceDetected:       'Face detected.',
  noFace:             'No face detected.',
  modelReady:         'AI model is ready.',
  testVoice:          'Hello. VisionAI is active and listening.',
}
