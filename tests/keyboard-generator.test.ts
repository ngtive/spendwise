import {
  generateCancelKeyboard,
  generateListKeyboard,
} from "../src/const/keyboards";

describe("Keyboard generators test", () => {
  test("Test cancel keyboard", async () => {
    const cancelKeyboard = generateCancelKeyboard();
    cancelKeyboard.forEach((row) => {
      row.forEach((col: any) => {
        expect(col.text).toBe("انصراف");
      });
    });
  });

  test("Test list keyboard generator", async () => {
    const keyboard = generateListKeyboard().keyboard;

    const expected = [
      "امروز",
      "دیروز",
      "ماه جاری",
      "ماه گذشته",
      "هفته جاری",
      "هفته گذشته",
      "سال جاری",
      "سال گذشته",
      "اکسل کل",
    ];
    let keyCounter = 0;
    keyboard.forEach((row) => {
      row.forEach((col: any) => {
        expect(col.text).toBe(expected[keyCounter]);
        keyCounter++;
      });
    });
  });
});
