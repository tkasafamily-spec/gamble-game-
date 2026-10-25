(() => {
  const S = window.STORE;
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => [...document.querySelectorAll(q)];
  const money = (n) => "$" + n.toFixed(2) + (S.currency === "USD" ? " USD" : " " + S.currency);
  const short = (n) => (n < 1 ? Math.round(n * 100) + "c" : "$" + (n % 1 ? n.toFixed(2) : n));
  const TEBEX = !!S.tebexToken;
  if (!TEBEX) document.querySelectorAll(".needs-tebex").forEach((e) => e.remove());

  const crown = (c) => `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 16l9 8 9-14 9 14 9-8-4 22H10z" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="6" cy="15" r="3" fill="${c}"/><circle cx="24" cy="9" r="3" fill="${c}"/><circle cx="42" cy="15" r="3" fill="${c}"/><path d="M12 33h24" stroke="${c}" stroke-width="2.5"/></svg>`;
  const key = (c) => `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="15" cy="24" r="9" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="2.5"/><circle cx="15" cy="24" r="3" fill="${c}"/><path d="M24 24h18M36 24v7M42 24v5" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/></svg>`;

  // ---------- fill the page ----------
  $("#brandName").textContent = S.serverName;
  $("#heroName").textContent = S.serverName;
  $("#ipText").textContent = S.serverIp;
  $("#gearNote").textContent = S.gearNote || "";
  document.title = S.serverName + " Store";
  if (S.discord) $("#discordLink").href = S.discord; else $("#discordLink").parentElement.remove();

  $("#rankGrid").innerHTML = S.ranks.map((r, i) => `
    <article class="card" style="--c:${r.color}">
      ${r.popular ? '<span class="tag">Popular</span>' : ""}
      <div class="icon">${crown(r.color)}</div>
      <h3>${r.name}</h3>
      <p class="len">${r.length || ""}</p>
      <ul>${r.perks.map((p) => `<li>${p}</li>`).join("")}</ul>
      <div class="bottom"><span class="price">${short(r.price)}<small>${S.currency}</small></span>
      <button class="btn" data-buy="rank:${i}">Buy</button></div>
    </article>`).join("");

  $("#keyGrid").innerHTML = S.keys.map((k, i) => `
    <article class="card key" style="--c:${k.color}">
      <div class="icon">${key(k.color)}</div>
      <h3>${k.name}</h3>
      <p class="blurb">${k.blurb || ""}</p>
      <div class="kq" data-k="${i}">
        <button type="button" data-kq="-1" aria-label="Less">−</button>
        <input type="number" min="1" max="999" value="1" inputmode="numeric" aria-label="How many keys">
        <button type="button" data-kq="1" aria-label="More">+</button>
      </div>
      <div class="kq-quick" data-k="${i}"><button type="button" data-kset="1">1</button><button type="button" data-kset="5">5</button><button type="button" data-kset="10">10</button><button type="button" data-kset="64">64</button></div>
      <div class="bottom"><span class="price" data-kp="${i}">${short(k.price)}<small>total</small></span>
      <button class="btn" data-buy="key:${i}">Buy</button></div>
    </article>`).join("");

  // pick how many keys right on the card
  const cardQty = (i) => Math.max(1, Math.min(999, +document.querySelector(`.kq[data-k="${i}"] input`).value | 0 || 1));
  const setCardQty = (i, q) => {
    q = Math.max(1, Math.min(999, q | 0 || 1));
    document.querySelector(`.kq[data-k="${i}"] input`).value = q;
    document.querySelector(`[data-kp="${i}"]`).innerHTML = short(+(S.keys[i].price * q).toFixed(2)) + "<small>" + (q === 1 ? "each" : "for " + q) + "</small>";
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kq],[data-kset]"); if (!b) return;
    const i = +b.parentElement.dataset.k;
    setCardQty(i, b.dataset.kset ? +b.dataset.kset : cardQty(i) + +b.dataset.kq);
  });
  document.addEventListener("input", (e) => { const w = e.target.closest(".kq"); if (w) setCardQty(+w.dataset.k, +e.target.value); });
  S.keys.forEach((_, i) => setCardQty(i, 1));

  $("#freeList").innerHTML = (S.freeStuff || []).map((f) => `<li>${f}</li>`).join("");

  const toast = (t) => { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 2200); };
  $("#copyIp").onclick = () => { navigator.clipboard?.writeText(S.serverIp); toast("IP copied!"); };

  // ---------- checkout window ----------
  const order = { item: null, kind: null, qty: 1, method: null, user: "" };
  const METHODS = { applepay: "Apple Pay", card: "Card", paypal: "PayPal" };

  function step(n) {
    $$(".step").forEach((s) => (s.hidden = +s.dataset.step !== n));
    $$(".progress span").forEach((p) => p.classList.toggle("on", +p.dataset.s <= n));
    $(".progress").hidden = n === 4; $(".m-item").hidden = n === 4;
  }
  const total = () => order.item.price * order.qty;
  function refreshPrice() {
    $("#mPrice").textContent = short(+total().toFixed(2));
  }

  function open(kind, i) {
    order.kind = kind; order.item = kind === "rank" ? S.ranks[i] : S.keys[i];
    order.qty = 1; order.method = null;
    const it = order.item;
    $("#mIcon").innerHTML = kind === "rank" ? crown(it.color) : key(it.color);
    $("#mTitle").textContent = it.name; $("#mTitle").style.color = it.color;
    $("#mSub").textContent = kind === "rank" ? "Rank · " + (it.length || "") : short(it.price) + " each";
    $("#qtyWrap").hidden = kind !== "key";
    $$(".method").forEach((m) => m.classList.remove("sel"));
    $("#toStep2").disabled = true;
    if ($$(".method").length === 1) $(".method").click();
    $("#userErr").hidden = true; $("#payErr").hidden = true;
    setQty(kind === "key" ? cardQty(i) : 1); step(1);
    $("#modal").hidden = false;
  }
  const close = () => ($("#modal").hidden = true);

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-buy]");
    if (b) { const [k, i] = b.dataset.buy.split(":"); open(k, +i); }
  });
  $("#mClose").onclick = close;
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // amount
  const setQty = (q) => { order.qty = Math.max(1, Math.min(999, q | 0 || 1)); $("#qty").value = order.qty; refreshPrice(); };
  $$("[data-q]").forEach((b) => (b.onclick = () => setQty(order.qty + +b.dataset.q)));
  $$("[data-set]").forEach((b) => (b.onclick = () => setQty(+b.dataset.set)));
  $("#qty").oninput = (e) => setQty(+e.target.value);

  // step 1 - payment method
  $$(".method").forEach((m) => (m.onclick = () => {
    $$(".method").forEach((x) => x.classList.remove("sel"));
    m.classList.add("sel"); order.method = m.dataset.m; $("#toStep2").disabled = false;
  }));
  $("#toStep2").onclick = () => { step(2); setTimeout(() => $("#username").focus(), 50); };
  $$("[data-back]").forEach((b) => (b.onclick = () => step(+b.dataset.back)));

  // step 2 - username
  const NAME = /^\.?[A-Za-z0-9_]{3,16}$/;
  let headT;
  $("#username").addEventListener("input", (e) => {
    const v = e.target.value.trim();
    clearTimeout(headT);
    headT = setTimeout(() => { $("#head").src = NAME.test(v) ? "https://mc-heads.net/avatar/" + encodeURIComponent(v.replace(/^\./, "")) + "/48" : ""; }, 350);
  });
  $("#username").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#toStep3").click(); });
  $("#toStep3").onclick = () => {
    const v = $("#username").value.trim();
    if (!NAME.test(v)) { const er = $("#userErr"); er.textContent = "That doesn't look like a Minecraft username (3-16 letters, numbers or _)."; er.hidden = false; return; }
    $("#userErr").hidden = true; order.user = v;
    $("#sItem").textContent = (order.kind === "key" ? order.qty + " × " : "") + order.item.name;
    $("#sUser").textContent = v; $("#sUser2").textContent = v;
    $("#sMethod").textContent = METHODS[order.method];
    $("#sTotal").textContent = money(total());
    $("#payAmt").textContent = short(+total().toFixed(2));
    const pp = order.method === "paypal" && S.paypal && S.paypal.link;
    $("#ppBox").hidden = !pp; $("#tebexHint").hidden = !!pp;
    if (pp) {
      order.code = "CS-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      $("#ppAmt").textContent = money(total());
      $("#ppName").textContent = S.paypal.name;
      $("#ppOpen").href = S.paypal.link;
      $("#ppCode").textContent = order.code;
      $("#ppNoteText").textContent = order.code + " | " + (order.kind === "key" ? order.qty + "x " : "") + order.item.name + " | " + v;
      $("#payBtn").textContent = "I've sent the payment";
    }
    step(3);
  };

  // step 3 - pay
  function showDone(title, text) {
    $("#doneTitle").textContent = title; $("#doneText").textContent = text; step(4); $("#modal").hidden = false;
  }
  $("#doneBtn").onclick = close;
  $("#ppNote").onclick = () => { navigator.clipboard?.writeText($("#ppNoteText").textContent); toast("Note copied!"); };

  $("#payBtn").onclick = async () => {
    const btn = $("#payBtn"); const err = $("#payErr"); err.hidden = true;
    if (order.method === "paypal" && S.paypal && S.paypal.link) {
      showDone("Almost done!", "Open a ticket in our Discord (#tickets) and send a screenshot of your PayPal payment with your order code " + order.code + ". Staff will give " + order.user + " the " + $("#sItem").textContent + " in-game.");
      return;
    }
    if (!order.item.tebexPackage) { err.textContent = "This item isn't set up yet. Please try again later."; err.hidden = false; return; }
    btn.disabled = true; btn.textContent = "Opening secure checkout…";
    try {
      const page = location.href.split(/[?#]/)[0];
      const r1 = await fetch(`https://headless.tebex.io/api/accounts/${S.tebexToken}/baskets`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complete_url: page + "?paid=" + encodeURIComponent(order.user), cancel_url: page, complete_auto_redirect: true, username: order.user })
      });
      const b1 = await r1.json();
      if (!r1.ok) throw new Error(b1.detail || b1.message || "Couldn't start checkout");
      const ident = b1.data.ident;
      const r2 = await fetch(`https://headless.tebex.io/api/baskets/${ident}/packages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: order.item.tebexPackage, quantity: order.qty })
      });
      const b2 = await r2.json();
      if (!r2.ok) throw new Error(b2.detail || b2.message || "Couldn't add item");
      if (window.Tebex && Tebex.checkout) {
        close();
        Tebex.checkout.init({ ident, theme: "dark", colors: [{ name: "primary", color: "#b46cff" }] });
        Tebex.checkout.on("payment:complete", () => showDone("Payment received!", "Thanks! " + order.user + " will get it in-game within a minute. Make sure you're online."));
        Tebex.checkout.launch();
      } else {
        location.href = (b2.data && b2.data.links && b2.data.links.checkout) || (b1.data.links && b1.data.links.checkout);
      }
    } catch (e) {
      err.textContent = "Something went wrong: " + e.message; err.hidden = false;
    } finally {
      btn.disabled = false; btn.innerHTML = 'Pay <span id="payAmt">' + short(+total().toFixed(2)) + "</span>";
    }
  };

  // back from the full-page checkout
  const paid = new URLSearchParams(location.search).get("paid");
  if (paid) {
    history.replaceState(null, "", location.pathname);
    order.item = S.ranks[0];
    showDone("Payment received!", "Thanks! " + paid + " will get it in-game within a minute. Make sure you're online.");
  }
})();
