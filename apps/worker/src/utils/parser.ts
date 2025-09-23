export function parse(
  text: string,
  values: any,
  startDelimeter = "{",
  endDelimeter = "}"
) {
  if (typeof text !== "string") {
    throw new Error("parse() expected a string but got " + typeof text);
  }
  let startIndex = 0;
  let endIndex = 1;

  let finalString = "";
  while (endIndex < text.length) {
    if (text[startIndex] === startDelimeter) {
      let endPoint = startIndex + 2;
      while (endPoint < text.length && text[endPoint] !== endDelimeter) {
        endPoint++;
      }
      if (endPoint >= text.length) {
        throw new Error("Unmatched delimiter in template: " + text);
      }
      //
      let stringHoldingValue = text.slice(startIndex + 1, endPoint);
      const keys = stringHoldingValue.split(".");
      let localValues = {
        ...values,
      };
      for (let i = 0; i < keys.length; i++) {
        if (typeof localValues === "string") {
          localValues = JSON.parse(localValues);
        }
        localValues = localValues?.[keys[i]];
      }
      finalString += localValues ?? "";
      startIndex = endPoint + 1;
      endIndex = endPoint + 2;
    } else {
      finalString += text[startIndex];
      startIndex++;
      endIndex++;
    }
  }
  if (text[startIndex]) {
    finalString += text[startIndex];
  }
  return finalString;
}
