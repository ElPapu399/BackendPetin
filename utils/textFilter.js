// Diccionario de las palabras bulgaras
const badWords = [
    "mierda", "puta", "puto", "idiota", "imbecil", "imbécil", 
    "estupido", "estúpido", "cabron", "cabrón", "pendejo", 
    "pendeja", "perra", "zorra", "maricon", "maricón",
    "chinga", "verga", "carajo", "joder", "coño", "tonto"
];

export const cleanText = (text) => {
    if (!text) return text;

    let safeText = text;
    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        safeText = safeText.replace(regex, '*'.repeat(word.length));
    });

    return safeText;
};
