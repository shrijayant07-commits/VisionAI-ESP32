const responses = {
  en: {
    person: {
      centre: [
        "Hey, there's someone standing right in front of you.",
        "Just letting you know, there's a person ahead of you."
      ],
      left: [
        "There's someone on your left."
      ],
      right: [
        "Hey, there's a person on your right."
      ]
    },

    bag: {
      centre: [
        "Careful, there's a bag right in front of you."
      ],
      left: [
        "There's a bag on your left. Watch out."
      ],
      right: [
        "There's a bag on your right."
      ]
    }
  },

  ta: {
    person: {
      centre: [
        "உங்களுக்கு முன்னாடி ஒருத்தர் நிக்கிறாங்க.",
        "உங்க முன்னாடி ஒரு நபர் இருக்காங்க, கொஞ்சம் கவனிங்க."
      ],
      left: [
        "உங்க இடது பக்கத்துல ஒருத்தர் இருக்காங்க."
      ],
      right: [
        "உங்க வலது பக்கத்துல ஒருத்தர் இருக்காங்க."
      ]
    },

    bag: {
      centre: [
        "உங்களுக்கு முன்னாடி ஒரு பை இருக்கு, கொஞ்சம் கவனமா இருங்க."
      ],
      left: [
        "உங்க இடது பக்கத்துல ஒரு பை இருக்கு."
      ],
      right: [
        "உங்க வலது பக்கத்துல ஒரு பை இருக்கு."
      ]
    }
  }
};

export function generateResponse({
  name,
  position = "centre",
  language = "en"
}) {
  const lang = responses[language] ? language : "en";
  const objectResponses = responses[lang][name?.toLowerCase()];
  const sentences = objectResponses?.[position] || objectResponses?.centre;

  if (!sentences) {
    return null;
  }

  return sentences[Math.floor(Math.random() * sentences.length)];
}

export function getObjectPosition(bbox, imageWidth) {
  const [x, y, width] = bbox;

  const objectCenter = x + width / 2;
  const relativePosition = objectCenter / imageWidth;

  if (relativePosition < 0.35) {
    return "left";
  }

  if (relativePosition > 0.65) {
    return "right";
  }

  return "centre";
}