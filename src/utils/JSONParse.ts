export function parseJsonString(input: string) {
  const cleanedInput = input.replace(/json\n|\n/g, "").trim();

  try {
    const jsonObject = JSON.parse(cleanedInput);

    return jsonObject;
  } catch (error) {
    console.error("Parsing error:", error);
    return null;
  }
}
