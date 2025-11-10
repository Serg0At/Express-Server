export default function generateRandomName() {
  const adjectives = ["Swift", "Silent", "Crypto", "Mighty", "Lucky", "Hidden"];
  const nouns = ["Whale", "Tiger", "Phoenix", "Wolf", "Trader", "Ninja"];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(1000 + Math.random() * 9000); // 4-digit number

  return `${adj}${noun}${number}`;
}

// Example outputs: "LuckyWolf4821", "SilentTrader9023"
