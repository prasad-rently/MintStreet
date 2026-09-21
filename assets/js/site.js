/* MintStreet — shared site behavior.
   Every block guards on the element existing, since not every page has
   the ticker, the quiz, the calculator, or the contagion explorer. */
(function () {
  "use strict";

  /* ---- reading progress & practice days (local to this browser, no account needed) ---- */
  (function () {
    function readJSON(key) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
    function writeJSON(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode etc. */ }
    }

    // Mark this dispatch as read, if this is a dispatch article page.
    if (document.querySelector(".post-article")) {
      var readList = readJSON("mintstreet_read_dispatches");
      var page = location.pathname.split("/").pop() || "index.html";
      if (readList.indexOf(page) === -1) {
        readList.push(page);
        writeJSON("mintstreet_read_dispatches", readList);
      }
    }

    // On the dispatches index, show progress and tick off read cards.
    var progressEl = document.getElementById("readProgress");
    if (progressEl) {
      var readSet = readJSON("mintstreet_read_dispatches");
      var cards = document.querySelectorAll(".card[data-tags]");
      var readCount = 0;
      cards.forEach(function (card) {
        var href = card.getAttribute("href");
        if (readSet.indexOf(href) !== -1) {
          readCount++;
          var pill = card.querySelector(".card-pill");
          if (pill) { pill.classList.add("is-read"); }
        }
      });
      if (readCount > 0) {
        progressEl.textContent = readCount + " / " + cards.length + " read";
      }
    }

    // On the Practice Sheets page, log today's visit as a distinct "practice day".
    var practiceDaysEl = document.getElementById("practiceDays");
    if (practiceDaysEl) {
      var today = new Date().toISOString().slice(0, 10);
      var days = readJSON("mintstreet_practice_days");
      if (days.indexOf(today) === -1) {
        days.push(today);
        writeJSON("mintstreet_practice_days", days);
      }
      if (days.length > 0) {
        practiceDaysEl.hidden = false;
        practiceDaysEl.textContent = "🗓️ " + days.length + (days.length === 1 ? " day" : " days") + " of practice logged";
      }
    }
  })();

  /* ---- ticker (every page) ---- */
  var tickerTrack = document.getElementById("tickerTrack");
  if (tickerTrack) {
    var TICKER = [
      { y: "1637", t: "Tulip bulb prices collapse in Amsterdam, ending the first recorded speculative bubble" },
      { y: "1602", t: "The Dutch East India Company sells the first freely-tradable shares, founding the Amsterdam exchange" },
      { y: "1875", t: "The Bombay Stock Exchange becomes Asia's oldest stock exchange" },
      { y: "1929", t: "The Wall Street Crash wipes out a decade of gains in days" },
      { y: "1994", t: "NSE launches as India's first fully electronic stock exchange" },
      { y: "2008", t: "Lehman Brothers files for bankruptcy; markets from Tokyo to Mumbai fall within the week" },
      { y: "2021", t: "Retail traders on Reddit force a short squeeze in GameStop stock" }
    ];
    var html = TICKER.map(function (i) {
      return '<span class="ticker-item"><strong>' + i.y + "</strong> — " + i.t + "</span>";
    }).join("");
    tickerTrack.innerHTML = html + html;
  }

  /* ---- dispatch search & tag filter (dispatches index) ---- */
  var dispatchSearch = document.getElementById("dispatchSearch");
  var filterChips = document.getElementById("filterChips");
  if (dispatchSearch && filterChips) {
    var activeTag = "all";
    var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-tags]"));
    var noResults = document.getElementById("noResults");

    function applyFilter() {
      var q = dispatchSearch.value.trim().toLowerCase();
      var visibleCount = 0;
      cards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(" ");
        var tagMatch = activeTag === "all" || tags.indexOf(activeTag) !== -1;
        var haystack = (card.getAttribute("data-title") || "") + " " + card.textContent.toLowerCase();
        var searchMatch = q === "" || haystack.toLowerCase().indexOf(q) !== -1;
        var show = tagMatch && searchMatch;
        card.style.display = show ? "" : "none";
        if (show) { visibleCount++; }
      });
      if (noResults) { noResults.classList.toggle("visible", visibleCount === 0); }
    }

    dispatchSearch.addEventListener("input", applyFilter);
    filterChips.querySelectorAll(".filter-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterChips.querySelectorAll(".filter-chip").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        activeTag = btn.getAttribute("data-tag");
        applyFilter();
      });
    });
  }

  /* ---- glossary search & category filter ---- */
  var glossarySearch = document.getElementById("glossarySearch");
  var glossaryChips = document.getElementById("glossaryChips");
  if (glossarySearch && glossaryChips) {
    var glossaryActiveCat = "all";
    var glossaryGroups = Array.prototype.slice.call(document.querySelectorAll(".glossary-group"));
    var glossaryTotal = document.querySelectorAll(".glossary-group .term").length;
    var glossaryCountEl = document.getElementById("glossaryCount");
    var glossaryNoResults = document.getElementById("glossaryNoResults");

    function applyGlossaryFilter() {
      var q = glossarySearch.value.trim().toLowerCase();
      var visibleCount = 0;
      glossaryGroups.forEach(function (group) {
        var catMatch = glossaryActiveCat === "all" || group.getAttribute("data-category") === glossaryActiveCat;
        var anyVisible = false;
        group.querySelectorAll(".term").forEach(function (term) {
          var text = term.textContent.toLowerCase();
          var show = catMatch && (q === "" || text.indexOf(q) !== -1);
          term.style.display = show ? "" : "none";
          if (show) { anyVisible = true; visibleCount++; }
        });
        group.style.display = anyVisible ? "" : "none";
      });
      if (glossaryCountEl) {
        glossaryCountEl.textContent = (glossaryActiveCat === "all" && q === "")
          ? glossaryTotal + " terms"
          : visibleCount + " matching";
      }
      if (glossaryNoResults) { glossaryNoResults.classList.toggle("visible", visibleCount === 0); }
    }

    glossarySearch.addEventListener("input", applyGlossaryFilter);
    glossaryChips.querySelectorAll(".filter-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        glossaryChips.querySelectorAll(".filter-chip").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        glossaryActiveCat = btn.getAttribute("data-cat");
        applyGlossaryFilter();
      });
    });
  }

  /* ---- jargon buster quiz (practice page) ---- */
  var quizMount = document.getElementById("quizMount");
  if (quizMount) {
    var QUIZ = [
      { q: "What does a stock's P/E (Price-to-Earnings) ratio tell you?", opts: [
        "How many years of profit it would take to earn back the share price at current earnings",
        "The dividend paid per share",
        "The company's total debt",
        "The number of shares outstanding"
      ], correct: 0, explain: "P/E = Share Price ÷ Earnings per Share. It's a rough gauge of how expensive a stock is relative to the profit it actually generates." },
      { q: "What is ‘market capitalization’?", opts: [
        "Total revenue of the company",
        "Share price × total number of outstanding shares",
        "The maximum price a stock can reach in a day",
        "A government limit on how much a company can trade"
      ], correct: 1, explain: "Market cap is the market's current price tag on the entire company — not its revenue or profit, just what all its shares are worth combined." },
      { q: "A ‘bear market’ typically means...", opts: [
        "Prices have fallen sharply and pessimism dominates",
        "Trading has been paused for the day",
        "Only large companies are being traded",
        "Interest rates have dropped to zero"
      ], correct: 0, explain: "Bear (falling, pessimistic) and bull (rising, optimistic) are the market's two standard moods — no official threshold, just the prevailing direction and mindset." },
      { q: "A dividend is...", opts: [
        "A fee brokers charge for buying a stock",
        "A portion of company profit paid out to shareholders",
        "A tax charged on stock purchases",
        "The opening price of a stock each day"
      ], correct: 1, explain: "Not every company pays one — many reinvest profits instead — but when they do, a dividend is your direct share of the profit, paid per share you own." },
      { q: "IPO stands for...", opts: [
        "Internal Profit Order",
        "Investment Protection Option",
        "Initial Public Offering — a company selling shares to the public for the first time",
        "Index Price Objective"
      ], correct: 2, explain: "Before an IPO, a company's shares are typically held privately by founders and early investors. An IPO is the moment it opens ownership to public markets." },
      { q: "In a Systematic Investment Plan (SIP), you...", opts: [
        "Invest a lump sum once, then never again",
        "Invest a fixed amount at regular intervals, such as monthly",
        "Only invest in physical gold",
        "Borrow money specifically to invest in stocks"
      ], correct: 1, explain: "SIPs automate discipline: the same amount, on the same date, regardless of what the market is doing that day." },
      { q: "A mutual fund's NAV (Net Asset Value) is...", opts: [
        "The fund manager's annual salary",
        "The number of investors currently in the fund",
        "The per-unit value of the fund's underlying holdings",
        "A price ceiling set by the government"
      ], correct: 2, explain: "NAV is simply the fund's total assets minus liabilities, divided by the number of units outstanding — what one unit of the fund is worth right now." },
      { q: "Diversification means...", opts: [
        "Putting all your money into one ‘sure thing’ stock",
        "Spreading investments across different assets to reduce risk",
        "Trading a stock multiple times in a single day",
        "Only investing in companies from your own country"
      ], correct: 1, explain: "The logic: if one investment performs badly, others may not — so the damage from any single bad outcome is limited." },
      { q: "Intraday trading (MIS) means...", opts: [
        "Buying shares and holding them for years",
        "Buying and selling the same shares within the same trading day",
        "Trading only during market holidays",
        "A type of mutual fund"
      ], correct: 1, explain: "Intraday positions are squared off the same day — you never actually take delivery of the shares into your demat account." },
      { q: "An options contract's 'premium' is...", opts: [
        "The full value of the underlying shares",
        "A penalty for late payment",
        "The price the option buyer pays for the right (not obligation) to buy or sell",
        "The broker's annual membership fee"
      ], correct: 2, explain: "The premium is the option buyer's maximum possible loss — walk away, and that's all it costs. The option seller takes on a much larger obligation in exchange for collecting it." }
    ];

    quizMount.innerHTML = QUIZ.map(function (item, qi) {
      var opts = item.opts.map(function (o, oi) {
        return '<label data-oi="' + oi + '"><input type="radio" name="q' + qi + '" value="' + oi + '"> <span>' + o + "</span></label>";
      }).join("");
      return '<div class="quiz-q" id="qwrap' + qi + '">' +
        '<p class="qtext">' + (qi + 1) + ". " + item.q + "</p>" +
        opts +
        '<div class="qexplain">' + item.explain + "</div>" +
        "</div>";
    }).join("");

    var checkBtn = document.getElementById("checkQuiz");
    if (checkBtn) {
      checkBtn.addEventListener("click", function () {
        var score = 0;
        QUIZ.forEach(function (item, qi) {
          var wrap = document.getElementById("qwrap" + qi);
          var selected = wrap.querySelector('input[name="q' + qi + '"]:checked');
          wrap.classList.add("answered");
          wrap.querySelectorAll("label").forEach(function (lab) {
            lab.classList.remove("correct", "incorrect");
            var oi = parseInt(lab.getAttribute("data-oi"), 10);
            if (oi === item.correct) { lab.classList.add("correct"); }
            else if (selected && parseInt(selected.value, 10) === oi) { lab.classList.add("incorrect"); }
          });
          if (selected && parseInt(selected.value, 10) === item.correct) { score++; }
        });
        var scoreBox = document.getElementById("quizScore");
        scoreBox.hidden = false;
        scoreBox.textContent = "Score: " + score + " / " + QUIZ.length;
      });
    }
  }

  /* ---- SIP compounding calculator (practice page) ---- */
  var sipAmount = document.getElementById("sipAmount");
  if (sipAmount) {
    var inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    function updateSip() {
      var amt = parseFloat(document.getElementById("sipAmount").value) || 0;
      var rate = parseFloat(document.getElementById("sipRate").value) || 0;
      var years = parseFloat(document.getElementById("sipYears").value) || 0;
      var n = Math.round(years * 12);
      var i = rate / 12 / 100;
      var fv;
      if (i > 0) { fv = amt * (((Math.pow(1 + i, n) - 1)) / i) * (1 + i); }
      else { fv = amt * n; }
      var invested = amt * n;
      var gain = Math.max(fv - invested, 0);
      document.getElementById("outInvested").textContent = inr.format(invested);
      document.getElementById("outGain").textContent = inr.format(gain);
      document.getElementById("outMaturity").textContent = inr.format(invested + gain);
      var total = invested + gain;
      var investedPct = total > 0 ? (invested / total * 100) : 100;
      document.getElementById("barInvested").style.width = investedPct + "%";
      document.getElementById("barGain").style.width = (100 - investedPct) + "%";
    }
    ["sipAmount", "sipRate", "sipYears"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", updateSip);
    });
    updateSip();
  }

  /* ---- purchasing power ("Shrinking Rupee") calculator (practice page) ---- */
  var ppAmount = document.getElementById("ppAmount");
  if (ppAmount) {
    var inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    function updatePP() {
      var amt = parseFloat(document.getElementById("ppAmount").value) || 0;
      var rate = parseFloat(document.getElementById("ppRate").value) || 0;
      var years = parseFloat(document.getElementById("ppYears").value) || 0;
      var futureNominal = amt;
      var realValue = amt / Math.pow(1 + rate / 100, years);
      var lost = futureNominal - realValue;
      document.getElementById("ppNominal").textContent = inr2.format(futureNominal);
      document.getElementById("ppReal").textContent = inr2.format(realValue);
      document.getElementById("ppLost").textContent = inr2.format(lost);
      var lostPct = futureNominal > 0 ? (lost / futureNominal * 100) : 0;
      document.getElementById("ppBarReal").style.width = (100 - lostPct) + "%";
      document.getElementById("ppBarLost").style.width = lostPct + "%";
    }
    ["ppAmount", "ppRate", "ppYears"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", updatePP);
    });
    updatePP();
  }

  /* ---- bond vs. fixed deposit comparator (practice page) ---- */
  var bfPrincipal = document.getElementById("bfPrincipal");
  if (bfPrincipal) {
    var inr3 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    function updateBondFd() {
      var p = parseFloat(document.getElementById("bfPrincipal").value) || 0;
      var rate = parseFloat(document.getElementById("bfRate").value) || 0;
      var years = parseFloat(document.getElementById("bfYears").value) || 0;
      var fdValue = p * Math.pow(1 + rate / 100, years);
      var bondValue = p + (p * (rate / 100) * years);
      document.getElementById("bfFdValue").textContent = inr3.format(fdValue);
      document.getElementById("bfBondValue").textContent = inr3.format(bondValue);
      document.getElementById("bfDiff").textContent = inr3.format(Math.max(fdValue - bondValue, 0));
    }
    ["bfPrincipal", "bfRate", "bfYears"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", updateBondFd);
    });
    updateBondFd();
  }

  /* ---- risk-comfort quiz (practice page) ---- */
  var riskMount = document.getElementById("riskMount");
  if (riskMount) {
    var RISK_Q = [
      { q: "How long until you might actually need this money?", opts: [
        "Less than a year", "1 to 3 years", "3 to 7 years", "7 years or more"
      ] },
      { q: "Your investment drops 20% in a month. You most likely...", opts: [
        "Sell everything immediately to stop the loss",
        "Sell some, keep some",
        "Do nothing and wait it out",
        "See it as a chance to buy more at a lower price"
      ] },
      { q: "How would you describe your investing experience so far?", opts: [
        "First time — this is all new",
        "A little — mainly FDs or savings",
        "Some — mutual funds or SIPs",
        "Comfortable with stocks, and open to derivatives"
      ] },
      { q: "Which matters more to you, honestly?", opts: [
        "Protecting what I already have, above all else",
        "Mostly protection, with a little room for growth",
        "Mostly growth, with some protection",
        "Maximum growth — I can handle the swings"
      ] },
      { q: "Given the choice between two portfolios...", opts: [
        "Definitely the one that grows slowly and steadily",
        "I'd lean toward steady, most of the time",
        "I'd lean toward faster growth, even with swings",
        "Definitely the one that grows faster, wild swings included"
      ] }
    ];
    var RISK_PROFILES = [
      { max: 8, name: "Conservative", note: "You lean toward protecting what you have. Discussions of fixed deposits, bonds, and debt funds (see the Bond vs. FD sheet above) are probably more relevant to you than most trading content on this site." },
      { max: 13, name: "Moderate", note: "You're comfortable with some ups and downs in exchange for growth, without wanting to bet the house. A mix of debt and equity is the typical shape of a moderate approach." },
      { max: 17, name: "Growth-oriented", note: "You're relatively comfortable with volatility in pursuit of higher long-term growth — the SIP and equity content on this site (see The ₹500 Habit) is squarely aimed at this mindset." },
      { max: 20, name: "Aggressive", note: "You're drawn to higher-risk, higher-reward approaches, potentially including derivatives. Module 4's coverage of futures and options is worth a careful, unhurried read before acting on that instinct." }
    ];

    riskMount.innerHTML = RISK_Q.map(function (item, qi) {
      var opts = item.opts.map(function (o, oi) {
        return '<label data-oi="' + oi + '"><input type="radio" name="r' + qi + '" value="' + (oi + 1) + '"> <span>' + o + "</span></label>";
      }).join("");
      return '<div class="quiz-q"><p class="qtext">' + (qi + 1) + ". " + item.q + "</p>" + opts + "</div>";
    }).join("");

    var checkRiskBtn = document.getElementById("checkRisk");
    if (checkRiskBtn) {
      checkRiskBtn.addEventListener("click", function () {
        var total = 0, answered = 0;
        RISK_Q.forEach(function (item, qi) {
          var selected = riskMount.querySelector('input[name="r' + qi + '"]:checked');
          if (selected) { total += parseInt(selected.value, 10); answered++; }
        });
        var resultBox = document.getElementById("riskResult");
        resultBox.hidden = false;
        if (answered < RISK_Q.length) {
          resultBox.textContent = "Answer all " + RISK_Q.length + " questions to see your result.";
          return;
        }
        var profile = RISK_PROFILES.filter(function (p) { return total <= p.max; })[0] || RISK_PROFILES[RISK_PROFILES.length - 1];
        resultBox.innerHTML = "Score: " + total + " / 20 — <strong>" + profile.name + "</strong><br><span style=\"font-family:var(--sans); font-weight:400; font-size:.9rem;\">" + profile.note + "</span>";
      });
    }
  }

  /* ---- diversification simulator (practice page) ---- */
  var divA = document.getElementById("divA");
  if (divA) {
    var DIV_DOMAIN_MIN = -40, DIV_DOMAIN_MAX = 80, DIV_RANGE = DIV_DOMAIN_MAX - DIV_DOMAIN_MIN;
    var ASSETS = [
      { id: "divA", ret: 14, swing: 40 },
      { id: "divB", ret: 12, swing: 20 },
      { id: "divC", ret: 8, swing: 12 },
      { id: "divD", ret: 7, swing: 2 }
    ];
    function pctOf(v) { return Math.max(0, Math.min(100, ((v - DIV_DOMAIN_MIN) / DIV_RANGE) * 100)); }
    function setRange(fillId, tickId, worst, best) {
      var left = pctOf(worst), right = pctOf(best);
      var fill = document.getElementById(fillId), tick = document.getElementById(tickId);
      fill.style.left = left + "%";
      fill.style.width = Math.max(right - left, 0.5) + "%";
      tick.style.left = right + "%";
    }
    function updateDiversify() {
      var raw = ASSETS.map(function (a) { return parseFloat(document.getElementById(a.id).value) || 0; });
      var sum = raw.reduce(function (a, b) { return a + b; }, 0);
      var weights = sum > 0 ? raw.map(function (v) { return v / sum; }) : ASSETS.map(function () { return 1 / ASSETS.length; });
      var pctIds = ["divAPct", "divBPct", "divCPct", "divDPct"];
      weights.forEach(function (w, i) { document.getElementById(pctIds[i]).textContent = Math.round(w * 100) + "%"; });

      var expected = 0, naiveSwing = 0, herfindahl = 0;
      ASSETS.forEach(function (a, i) {
        expected += weights[i] * a.ret;
        naiveSwing += weights[i] * a.swing;
        herfindahl += weights[i] * weights[i];
      });
      var swing = naiveSwing * Math.sqrt(herfindahl);
      var best = expected + swing, worst = expected - swing;

      document.getElementById("divExpected").textContent = (expected >= 0 ? "+" : "") + expected.toFixed(1) + "%";
      document.getElementById("divWorst").textContent = (worst >= 0 ? "+" : "") + worst.toFixed(1) + "%";
      document.getElementById("divBest").textContent = (best >= 0 ? "+" : "") + best.toFixed(1) + "%";
      setRange("divPortfolioFill", "divPortfolioTick", worst, best);

      var solo = ASSETS[0];
      setRange("divSoloFill", "divSoloTick", solo.ret - solo.swing, solo.ret + solo.swing);
    }
    ASSETS.forEach(function (a) {
      document.getElementById(a.id).addEventListener("input", updateDiversify);
    });
    updateDiversify();
  }

  /* ---- paper trade simulator (practice page) ---- */
  var ptChart = document.getElementById("ptChart");
  if (ptChart) {
    var PT_PRICES = [100, 104, 102, 108, 112, 109, 115, 120, 118, 125, 122, 130, 126, 119, 108, 98, 105, 110, 116, 121];
    var PT_MIN = Math.min.apply(null, PT_PRICES), PT_MAX = Math.max.apply(null, PT_PRICES);
    var inrPT = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    var ptState = { day: 1, qty: 0, avgPrice: 0, realized: 0, trades: [] };

    function ptPrice() { return PT_PRICES[ptState.day - 1]; }

    function ptDrawChart() {
      var w = 600, h = 170, pad = 16;
      function xFor(i) { return pad + (i / (PT_PRICES.length - 1)) * (w - 2 * pad); }
      function yFor(p) { return h - pad - ((p - PT_MIN) / (PT_MAX - PT_MIN || 1)) * (h - 2 * pad); }
      var pts = PT_PRICES.slice(0, ptState.day).map(function (p, i) { return xFor(i) + "," + yFor(p); }).join(" ");
      var markers = ptState.trades.map(function (t) {
        var color = t.type === "buy" ? "var(--accent)" : (t.pl >= 0 ? "var(--up)" : "var(--down)");
        return '<circle cx="' + xFor(t.day - 1) + '" cy="' + yFor(t.price) + '" r="4.5" fill="' + color + '" stroke="var(--bg)" stroke-width="1.5"></circle>';
      }).join("");
      var current = '<circle cx="' + xFor(ptState.day - 1) + '" cy="' + yFor(ptPrice()) + '" r="5" fill="var(--ink)" stroke="var(--accent)" stroke-width="2"></circle>';
      var label = "MINT price chart, day " + ptState.day + " of " + PT_PRICES.length + ", currently " + inrPT.format(ptPrice());
      ptChart.innerHTML =
        '<svg viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + label + '" style="width:100%; height:auto; overflow:visible;">' +
        '<polyline points="' + pts + '" fill="none" stroke="var(--accent)" stroke-width="2"></polyline>' +
        markers + current + "</svg>";
    }

    function ptRenderStats() {
      var price = ptPrice();
      var unreal = ptState.qty > 0 ? (price - ptState.avgPrice) * ptState.qty : 0;
      var total = ptState.realized + unreal;
      document.getElementById("ptDay").textContent = "Day " + ptState.day + " of " + PT_PRICES.length;
      document.getElementById("ptPrice").textContent = inrPT.format(price);
      document.getElementById("ptPosition").textContent = ptState.qty > 0
        ? (ptState.qty + " shares @ " + inrPT.format(ptState.avgPrice))
        : "No position";
      document.getElementById("ptUnrealized").textContent = (unreal >= 0 ? "+" : "") + inrPT.format(unreal);
      document.getElementById("ptRealized").textContent = (ptState.realized >= 0 ? "+" : "") + inrPT.format(ptState.realized);
      document.getElementById("ptTotal").textContent = (total >= 0 ? "+" : "") + inrPT.format(total);
      document.getElementById("ptBuyBtn").hidden = ptState.qty > 0;
      document.getElementById("ptSellBtn").hidden = ptState.qty <= 0;
      document.getElementById("ptNextBtn").disabled = ptState.day >= PT_PRICES.length;
      document.getElementById("ptQty").disabled = ptState.qty > 0;
    }

    function ptRenderLog() {
      var log = document.getElementById("ptLog");
      if (ptState.trades.length === 0) {
        log.innerHTML = '<li style="color:var(--muted); list-style:none; margin-left:-1.2em;">No trades yet — buy on any day to open a position.</li>';
        return;
      }
      log.innerHTML = ptState.trades.slice().reverse().map(function (t) {
        if (t.type === "buy") { return "<li>Day " + t.day + " — Bought " + t.qty + " @ " + inrPT.format(t.price) + "</li>"; }
        return "<li>Day " + t.day + " — Sold " + t.qty + " @ " + inrPT.format(t.price) + " (" + (t.pl >= 0 ? "+" : "") + inrPT.format(t.pl) + ")</li>";
      }).join("");
    }

    function ptRender() { ptDrawChart(); ptRenderStats(); ptRenderLog(); }

    document.getElementById("ptBuyBtn").addEventListener("click", function () {
      var qty = parseInt(document.getElementById("ptQty").value, 10) || 0;
      if (qty <= 0 || ptState.qty > 0) { return; }
      ptState.qty = qty;
      ptState.avgPrice = ptPrice();
      ptState.trades.push({ type: "buy", day: ptState.day, price: ptPrice(), qty: qty });
      ptRender();
    });
    document.getElementById("ptSellBtn").addEventListener("click", function () {
      if (ptState.qty <= 0) { return; }
      var price = ptPrice();
      var pl = (price - ptState.avgPrice) * ptState.qty;
      ptState.realized += pl;
      ptState.trades.push({ type: "sell", day: ptState.day, price: price, qty: ptState.qty, pl: pl });
      ptState.qty = 0;
      ptState.avgPrice = 0;
      ptRender();
    });
    document.getElementById("ptNextBtn").addEventListener("click", function () {
      if (ptState.day < PT_PRICES.length) { ptState.day++; ptRender(); }
    });
    document.getElementById("ptResetBtn").addEventListener("click", function () {
      ptState = { day: 1, qty: 0, avgPrice: 0, realized: 0, trades: [] };
      ptRender();
    });
    ptRender();
  }

  /* ---- global contagion explorer (practice page) ---- */
  var captionBox = document.getElementById("contagionCaption");
  if (captionBox) {
    var CONTAGION = {
      nyse: {
        title: "Wall Street — NYSE, New York (the epicenter)",
        text: "September 15, 2008 — Lehman Brothers files for bankruptcy. Credit markets freeze almost overnight as banks stop lending to each other, unsure who else is quietly holding the same toxic mortgage debt."
      },
      london: {
        title: "London — FTSE 100",
        text: "As a global banking hub with deep, direct ties to Wall Street, London felt the shock almost immediately. Domestic banks including RBS and HBOS came under severe strain, and the FTSE 100 fell alongside American markets in the very same trading sessions."
      },
      tokyo: {
        title: "Tokyo — Nikkei 225",
        text: "Japanese banks and major exporters were closely tied to U.S. financial firms and consumer demand. The Nikkei fell more than 11% in the days after Lehman's collapse — one of its steepest short-term drops in decades — as investors rushed toward safety."
      },
      seoul: {
        title: "Seoul — KOSPI",
        text: "South Korea's export-driven, foreign-capital-dependent market saw a sharp equity sell-off alongside a fall in the won, as global investors pulled dollars out of emerging Asia to cover losses elsewhere."
      },
      mumbai: {
        title: "Mumbai — Sensex",
        text: "Foreign Institutional Investors, who had poured money into Indian equities through the earlier boom years, reversed course — selling Indian shares to raise cash for problems back home. The Sensex fell further, and the rupee weakened against the dollar as capital left."
      }
    };
    function renderCaption(key) {
      var c = CONTAGION[key];
      captionBox.innerHTML = "<h3>" + c.title + "</h3><p>" + c.text + "</p>";
    }
    function selectNode(key) {
      document.querySelectorAll(".node").forEach(function (g) {
        var isSel = g.getAttribute("data-node") === key;
        g.querySelector(".node-dot").classList.toggle("active", isSel);
        g.setAttribute("aria-pressed", isSel ? "true" : "false");
      });
      ["tokyo", "seoul", "mumbai", "london"].forEach(function (k) {
        var line = document.getElementById("line-" + k);
        if (line) { line.classList.toggle("active", key === "nyse" || key === k); }
      });
      renderCaption(key);
    }
    document.querySelectorAll(".node").forEach(function (g) {
      g.addEventListener("click", function () { selectNode(g.getAttribute("data-node")); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectNode(g.getAttribute("data-node")); }
      });
    });
    selectNode("nyse");
  }
})();
