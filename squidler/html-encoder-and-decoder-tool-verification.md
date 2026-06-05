---
squidlerFormat: 1
name: "HTML Encoder and Decoder Tool Verification"
deviceType: DESKTOP
---

- Verify HTML encoding of special characters including double quotes
  - Navigate directly to /tool/html-encoder
  - Type "<div class=\"test\">Hello & welcome</div>" into the input textarea
  - Click the Encode button
  - Verify the output textarea contains "&lt;div class=&quot;test&quot;&gt;Hello &amp; welcome&lt;/div&gt;"

- Verify HTML decoding of entities back to plain text
  - Clear the input textarea
  - Type "&lt;p&gt;It&#39;s &amp; working&lt;/p&gt;" into the input
  - Click the Decode button
  - Verify the output shows "<p>It's & working</p>"
