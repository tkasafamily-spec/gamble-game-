// ============================================================
//  CratorSMP Store settings - this is the only file you need to edit.
// ============================================================
window.STORE = {
  serverName: "CratorSMP",
  serverIp: "cratorsmp.modrinth.gg",
  discord: "",                // e.g. "https://discord.gg/xxxx" (leave "" to hide the button)
  currency: "USD",

  // PayPal: players scan the QR / open this link, send the money, then open a Discord ticket with a screenshot.
  paypal: {
    name: "Trevor Price",
    link: "https://www.paypal.com/qrcodes/p2pqrc/9E4D9QZNXL6UQ"
  },

  // OPTIONAL - automatic Apple Pay / card / delivery later: your Tebex PUBLIC token (Tebex panel -> Integrations -> Webstore token / Headless API).
  // Leave "" to only show PayPal.
  tebexToken: "",

  // Each product: tebexPackage = the package ID (or ident) from the Tebex panel.
  ranks: [
    {
      id: "crator_plus", name: "Crator+", color: "#55ffff", price: 3.00, length: "30 days",
      tebexPackage: "",
      perks: ["15 homes", "2x crystals in AFK", "Crystals no matter where you are", "Fly at spawn", "Netherite Crystal Gear on respawn"]
    },
    {
      id: "crator_plus_plus", name: "Crator++", color: "#55aaff", price: 6.00, length: "30 days", popular: true,
      tebexPackage: "",
      perks: ["30 homes", "2x crystals in AFK", "Crystals no matter where you are", "Fly at spawn", "Netherite Crystal Gear on respawn", "/ec - ender chest anywhere"]
    },
    {
      id: "crator_plus_plus_plus", name: "Crator+++", color: "#3b82f6", price: 12.00, length: "30 days",
      tebexPackage: "",
      perks: ["60 homes", "2x crystals in AFK", "Crystals no matter where you are", "Fly at spawn", "Netherite Crystal Gear on respawn", "/ec - ender chest anywhere"]
    }
  ],

  keys: [
    { id: "excavator", name: "Excavator Key", color: "#f5a524", price: 0.65, tebexPackage: "", blurb: "Open the Excavator Crate at spawn" },
    { id: "crystal",   name: "Crystal Key",   color: "#d48cff", price: 0.50, tebexPackage: "", blurb: "Open the Crystal Crate at spawn" },
    { id: "sky",       name: "Fly Key",       color: "#7dd3fc", price: 0.40, tebexPackage: "", blurb: "Open the Fly Crate - 16 skeleton spawners per key" }
  ],

  freeStuff: [
    "Crystal rank - free, just join the Discord",
    "Basic key - free every 30 minutes of playtime"
  ],

  gearNote: "Crystal Gear = Unbreaking III, Blast Protection IV & Mending"
};
