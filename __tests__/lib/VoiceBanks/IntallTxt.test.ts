import { describe,  expect, it } from "vitest";
import { InstallTxt,InstallTxtValue } from "../../../src/lib/VoiceBanks/InstallTxt";

describe("InstallTxt", () => {
    it("throw error",()=>{
        expect(()=>{new InstallTxt({})}).toThrow("txtかfolderのどちらかが必要です")
    })
    it("values_minimum",()=>{
        const install = new InstallTxt({folder:"foo"})
        expect(install.folder).toBe("foo")
    })
    it("values_all",()=>{
        const install = new InstallTxt({folder:"foo",contentsDir:"bar",description:"test"})
        expect(install.folder).toBe("foo")
        expect(install.contentsDir).toBe("bar")
        expect(install.description).toBe("test")
    })
    it("text_minimum",()=>{
        const install = new InstallTxt({txt:"type=voiceset\r\nfolder=foo\r\n"})
        expect(install.folder).toBe("foo")
    })
    it("text_all",()=>{
        const install = new InstallTxt({txt:"type=voiceset\r\nfolder=foo\r\ncontentsdir=bar\r\ndescription=test"})
        expect(install.folder).toBe("foo")
        expect(install.contentsDir).toBe("bar")
        expect(install.description).toBe("test")
    })
    it("output_minimum",()=>{
        const install = new InstallTxt({folder:"foo"})
        const output = install.OutputTxt()
        expect(output).toBe("type=voiceset\r\nfolder=foo\r\n")
    })
    it("output_with_contentdir",()=>{
        const install = new InstallTxt({folder:"foo",contentsDir:"bar"})
        const output = install.OutputTxt()
        expect(output).toBe("type=voiceset\r\nfolder=foo\r\ncontentsdir=bar\r\n")
    })
    it("output_with_description",()=>{
        const install = new InstallTxt({folder:"foo",description:"test"})
        const output = install.OutputTxt()
        expect(output).toBe("type=voiceset\r\nfolder=foo\r\ndescription=test\r\n")
    })
    it("output_all",()=>{
        const install = new InstallTxt({folder:"foo",contentsDir:"bar",description:"test"})
        const output = install.OutputTxt()
        expect(output).toBe("type=voiceset\r\nfolder=foo\r\ncontentsdir=bar\r\ndescription=test\r\n")
    })
})