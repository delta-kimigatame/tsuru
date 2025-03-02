export const translationEn = {
  language: {
    ja: "JA",
    en: "EN",
  },
  menu: {
    toDarkMode: "to Dark Mode",
    toLightMode: "to Light Mode",
    changeLanguage: "Language setting",
    showLog: "Show Log",
    logAttention:
      "Logs are not sent automatically, so please send them to the developer if necessary.",
  },
  top: {
    catchphrase: "Let's UTA! Let's go!",
    descriptions: [
      "UTAlet is a browser-based voice synthesis tool using UTAU voicebanks.",
      "It is designed to work with both CV (Consonant-Vowel) and VCV (Vowel-Consonant-Vowel) voicebanks.",
    ],
    selectZipButtonText: "Agree and Proceed",
    selectZipButtonDescription:
      "By clicking 'Agree and Proceed', you accept the Terms of Use and select the UTAU VoiceBank ZIP file.",
    rule: "Terms of service",
    ruleDescription:
      "Only voice sources with permission from the voice rights holder may be used.",
    ruleDescription2:
      "If you wish to use someone else's voice, you must obtain their explicit permission.",
    privacy: "Privacy Policy",
    privacyAnalytics: `We use Google Analytics to analyze visitor behavior on our site. The data collected through Google Analytics is anonymous and does not identify individual users.`,
    privacyCookie:
      "Cookies are used to customize the display and user interaction for improving user experience. These cookies do not collect personal data and are only used to enhance the site's usability.",
    privacyOffline:
      "This service is designed to work fully offline and does not engage in any communication with external servers.",
    privacyWorker:
      "The workers used on this site do not collect any privacy-related data.",
    history: "Release Note",
    changelog: ["2025/03/** Release"],
  },
  loadVBDialog: {
    title: "Read Zip",
    encodeCheck: "Check the encoding",
    encoding: "character code",
    submit: "OK",
    error: "Load Error.This file is not UTAU VoiceBank.",
  },
  editor: {
    file_check: {
      title: "File Check",
      all: "Select All",
      file_list: "File List",
      contentsdir: {
        title: "Voicebank Root (Folder containing files to install)",
        description: `Changing this setting will discard edits to 
          character.txt, character.yaml, readme.txt, install.txt, and prefix.map.`,
      },
      remove: {
        title: "Delete Unnecessary Files",
        read: "Delete $read",
        uspec: "Delete UTAU voicebank cache files (*.uspec)",
        setparam: "Delete setParam cache files (oto.setParam-Scache)",
        vlabeler: "Delete vLabeler cache folders (*.lbp.caches/)",
      },
      frq: {
        title: "Frequency Table Files",
        description: `By default, all files except frq will be deleted.
          Keep them if you have manually modified the frequency table.`,
        frq: "Generate UTAU standard frequency table (*.frq) if missing",
        pmk: "Delete tips engine frequency table (*.pmk)",
        frc: "Delete model4 engine frequency table (*.frc) (Distribution prohibited by terms of use)",
        vs4ufrq: "Delete VS4U engine frequency table (*.vs4ufrq)",
        world: "Delete w4u engine frequency table (*.dio, *.stac, *.platinum)",
        llsm: "Delete moresampler analysis file (*.llsm)",
        mrq: "Delete moresampler analysis file (*.mrq)",
      },
      oto: {
        title: "oto.ini",
        root: "Generate an empty oto.ini if none exists in the voicebank root",
      },
      wav: {
        title: "Audio Data",
        description: "Select all by default",
        stereo: "Convert stereo voicebanks to mono",
        sampleRate: "Set sampling rate to 44,100 Hz",
        depth: "Set bit depth to 16-bit",
        dcoffset: "Remove DC offset",
      },
    },
    character: {
      title: "Character",
      description: "Information about the voicebank. This is required.",
      check: "Create or update character.txt (always created if missing)",
      convertBmp:
        "Select an image and convert it to a UTAU icon (bmp/jpg/gif/png)",
      field: {
        name: "Voicebank Name",
        image: "Icon Image (bmp/jpg/gif)",
        sample: "Sample Audio",
        author: "Administrator",
        web: "Website",
        version: "Version Info",
        convertBmp: "Select an external image (bmp/jpg/gif/png)",
        uploadSample: "Select an external audio file (wav)",
      },
    },
    characterYaml: {
      description: "Additional settings for OpenUtau.",
      check: "Create or update character.yaml",
      TextFileEncoding: "Specify text file encoding (shift-jis)",
      Portrait: "Standing Illustration",
      PortraitUpload: "Select an external image (png)",
      PortraitOpacity: "Standing Illustration Opacity",
      PortraitHeight: "Standing Illustration Height",
      Voice: "Voice Provider",
    },
    readme: {
      title: "Readme & Terms of Use",
      check: "Create or update readme.txt",
      description: `Displayed when using the voicebank for the first time. 
        It is recommended to include terms of use and voicebank details.`,
    },
    install: {
      title: "Installation Settings",
      check: "Create or update install.txt",
      description: "Allows drag-and-drop installation into UTAU.",
      field: {
        folder: "Installation Destination Folder",
        contentsdir: "Folder containing files to install",
        description: "One-line description for installation",
      },
    },
    prefixmap: {
      title: "prefix.map",
      description:
        "Settings to automatically switch voicebanks based on pitch.",
      description2: "Voice Color is not available in standard UTAU.",
      check: "Create or update prefix.map",
      header: {
        tone: "Pitch",
        prefix: "Prefix",
        suffix: "Suffix",
      },
      voiceColor: "Voice Color",
      add: "Add",
      change: "Modify",
      delete: "Delete",
      all: "Select All",
      cancel: "Deselect",
      set: "Set",
      clear: "Clear",
    },
    output: "Generate ZIP File",
    download: "Download",
  },
  footer: {
    disclaimer:
      "UTAU is a singing voice synthesis software created for Windows and published by 飴屋／菖蒲",
    disclaimer2: "This software is not affiliated with UTAU official.",
    developerx: "Developer X account",
    github: "github",
    discord: "discord",
  },
  loadZipDialog: {
    title: "Read Zip",
    encodeCheck: "Check the encoding",
    encoding: "character code",
    reload: "Reload with the specified character code",
    submit: "OK",
    error: "ERROR",
  },
  xbutton: {
    share: "share",
  },
  error: {
    title: "Error",
    message:
      "An unexpected error has occurred. Please download the log from the button below and send it to the developer.",
    download: "Download Log",
    log: "Log",
  },
};
