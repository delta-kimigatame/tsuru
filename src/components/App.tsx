import JSZip from "jszip";
import * as React from "react";
import { defaultNote } from "../config/note";
import { renderingConfig } from "../config/rendering";
import { Resamp } from "../lib/Resamp";
import { Ust } from "../lib/Ust";
import { VoiceBank } from "../lib/VoiceBanks/VoiceBank";
import { Wavtool } from "../lib/Wavtool";
import { ResampRequest } from "../types/request";

export const App: React.FC = () => {
    const [ust,setUst]=React.useState<Ust>(null)
  const [vb, setVb] = React.useState<VoiceBank>(null);
  const [resamp, setResamp] = React.useState<Resamp>(null);
  const [url, setUrl] = React.useState<string>("");
  const wavtool = new Wavtool();
  // const resamp=new Resamp()
  const handleUstChange = async (e) => {
    const f: File = e.target.files[0];
    f.arrayBuffer().then(async(buf) => {
        const u=new Ust()
      u.load(buf).then(()=>{
        setUst(u)
        console.log("loaded ust");
      });
    });
  };

  const handleZipChange = async (e) => {
    const f: File = e.target.files[0];
    f.arrayBuffer().then(async (buf) => {
      const zip = new JSZip();
      const td = new TextDecoder("shift-jis");
      zip
        .loadAsync(buf, {
          decodeFileName: (fileNameBinary: Uint8Array) =>
            td.decode(fileNameBinary),
        })
        .then(async (z) => {
          const v = new VoiceBank(z.files);
          v.initialize().then(() => {
            setVb(v);
            console.log("load voicebank");
          });
        });
    });
  };
  React.useEffect(() => {
    if (vb!==null) {
      const r = new Resamp(vb);
      r.initialize().then(() => {
        setResamp(r);
        console.log("resamp ready");
      });
    }
  }, [vb]);

  React.useEffect(() => {
    if (resamp!==null) {
      const params = ust.getRequestParam(vb, defaultNote);
      render(params);
    }
  }, [resamp]);

  const render = async (params) => {
    const wav0 = new Array(
      Math.ceil((params[0].append.length / 1000) * renderingConfig.frameRate)
    ).fill(0);
    wavtool.append({ inputData: wav0, ...params[0].append });
    console.log(`休符追加:${Date.now()}`);
    for (let i = 1; i <= 7; i++) {
      const wav1 = await resamp.resamp(params[i].resamp as ResampRequest);
      wavtool.append({ inputData: wav1, ...params[i].append });
      console.log(`ノート${i}個目:${Date.now()}`);
    }
    const wav8 = new Array(
      Math.ceil((params[8].append.length / 1000) * renderingConfig.frameRate)
    ).fill(0);
    wavtool.append({ inputData: wav8, ...params[8].append });
    console.log(`休符追加:${Date.now()}`);
    const w = wavtool.output();
    setUrl(URL.createObjectURL(new File([w], "output.wav")));
  };

  return (
    <>
      <input
        type="file"
        id="input-file"
        accept="Ust,.ust"
        onChange={handleUstChange}
      />
      <br />

      <input
        type="file"
        id="input-file"
        accept="Zip,zip"
        onChange={handleZipChange}
      />
      <br />
      {url!=="" && (
        <>
          <audio src={url} controls style={{ margin: 8 }}></audio>
        </>
      )}
    </>
  );
};
