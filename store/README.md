# CratorSMP Store

The webstore for CratorSMP. Players pick a rank or key, choose Apple Pay / card / PayPal, type their Minecraft
username and pay on the secure Tebex checkout. Tebex then runs the commands on the server, so it's given in-game automatically.

Hosted free on GitHub Pages. Everything you need to change is in **`config.js`**.

## Connecting real payments (Tebex)

1. Make a free account at https://creator.tebex.io and create a **Minecraft (Java)** webstore, currency **USD**.
2. **Payments:** Tebex panel → Payments → turn on **PayPal**, **Card** and **Apple Pay** (Tebex is the seller, it pays you out).
3. **Server:** put the Tebex plugin (`Tebex.jar` from the Tebex panel → Game Servers) in the server's `plugins` folder,
   restart, then type in console: `tebex secret <your secret key>`.
4. **Packages:** Tebex panel → Packages → make one package per item. In each package add a command,
   set it to **"Require player to be online"**:

   | Package       | Price | Command                                   |
   |---------------|-------|-------------------------------------------|
   | Crator+       | 3.00  | `giverank {username} crator_plus 30d`           |
   | Crator++      | 6.00  | `giverank {username} crator_plus_plus 30d`      |
   | Crator+++     | 12.00 | `giverank {username} crator_plus_plus_plus 30d` |
   | Excavator Key | 0.65  | `crate givekey {username} excavator 1`    |
   | Crystal Key   | 0.50  | `crate givekey {username} crystal 1`      |
   | Fly Key       | 0.40  | `crate givekey {username} sky 1`          |

   For keys, turn on **"Allow quantity"** so the command runs once per key bought.
5. Copy each package's **ID** into `tebexPackage` in `config.js`, and your **public token**
   (Tebex panel → Integrations → Headless API / Webstore token) into `tebexToken`.

While `tebexToken` is empty the site runs in **demo mode**: it walks through checkout but charges nothing.
