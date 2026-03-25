let letters = "ABCDEFGHJKMNPQRSTUVWXYZ"
let numbers = "0123456789"

export function generateRoomCode() {
  let code = ""

  // 3 letras aleatorias
  for (let i = 0; i < 3; i++) {
    code += letters[Math.floor(Math.random() * letters.length)]
  }

  // 3 números aleatorios
  for (let i = 0; i < 3; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)]
  }

  return code
}


