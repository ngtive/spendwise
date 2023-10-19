import glob from "glob";
import fs from "fs";

test("No console.log in source files", () => {
  const files = glob.sync("src/**/*.ts");

  files.forEach((file: string) => {
    const fileContent = fs.readFileSync(file, "utf8");
    if (fileContent.includes("console.log")) {
      throw new Error(`Found console.log in file: ${file}`);
    }
  });
});
