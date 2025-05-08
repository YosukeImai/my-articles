---
theme: seriph
layout: section
hideInToc: true
---
# VOD配信を実装するためのTips
## 今井陽介
---
layout: default
hideInToc: true
title: 概要
---
# 概要
<div class="h1-gradient">
Web動画配信を実装する際に知っておきたい主要なポイントを解説します：
</div>
<ul class="li-text">
  <li>動画配信フォーマットの種類と選定基準</li>
  <li>要件に応じた実装アプローチ</li>
  <li>MP4配信のメリットと実装時の注意点</li>
  <li>HLSによるアダプティブストリーミングの実現方法</li>
  <li>動画コンテンツ保護のためのDRM概要</li>
</ul>

---
layout: default
hideInToc: true
---

# 目次

<Toc text-sm minDepth="1" maxDepth="2" />

---
layout: default
title: 配信フォーマット
---

# 配信フォーマット
<div class="h1-gradient">
Webサービスで動画配信する場合、いくつかフォーマットはありますが主にHLS,mp4, MPEG-DASHが主な選択肢になります。
</div>

### **MP4（単一フォーマット）**
<ul class="li-text">
  <li>単一ファイル形式であり、幅広いデバイスでサポートされている汎用的なフォーマットです。</li>
</ul>

### **HLS**
<ul class="li-text">
  <li>HTTP Live Streaming。Appleが開発したストリーミング形式で、動画をセグメントに分割して配信します。</li>
</ul>

### **MPEG-DASH**
<ul class="li-text">
  <li>Dynamic Adaptive Streaming over HTTPの略。複数の品質でセグメント化された動画を配信する国際標準規格です。</li>
</ul>
---
layout: default
title: 要件別対応方針
---
# 要件別の対応方針

| 要件 | 対応方針 | 実装方法 |
|------|---------|---------|
| 動画を加工せず配信 | MP4をそのまま配信 | - GCSに保存<br>- CDNで配信 |
| 動画を加工して配信（解像度は単一・DRMなし） | 動画をMP4に変換して配信 | - Transcoder APIで動画変換<br>- GCSに保存<br>- CDNで配信 |
| 動画を加工して配信（解像度は複数・DRMなし） | HLSに変換して複数解像度で配信 | - Transcoder APIで動画変換<br>- GCSに保存<br>- CDNで配信 |
| 動画を加工して配信（DRMあり） | 暗号化してHLS配信（DRM認証付き） | - DRMサポート付き外部サービスを利用<br>- 自プロジェクトに組み込み |
---
layout: default
title: MP4の配信方法
---
# MP4の配信方法
<div class="h1-gradient">
解像度について特別な要件がなければ、MP4の単一ファイルを配信する方法が適しています。
</div>

### **HTTP Rangeリクエストを使用した配信**
<ul class="li-text">
  <li>Rangeリクエストとは、HTTPプロトコルの範囲指定機能で、ファイル全体ではなく特定のバイト範囲だけを取得するリクエストです。</li>
  <li>必要なデータのみを効率的に取得できるため、帯域幅の節約や高速再生が可能。</li>
  <li>動画の任意の位置（シーク位置）から再生を開始できる。</li>
</ul>

---
layout: default
title: MP4のファイル構造と注意点
---
### **MP4ファイルの構造と配信の関係**
MP4ファイルは、以下のような構造を持っています。
<ol class="li-text">
  <li><strong>ftyp（File Type Box）</strong>：ファイルタイプや互換性情報</li>
  <li><strong>moov（Movie Box）</strong>：動画全体の構造やメタデータ</li>
  <li><strong>mdat（Media Data Box）</strong>：実際の動画や音声データ</li>
</ol>

<br>

### **配信における注意点**
**moovボックスの位置**
<ul class="li-text">
  <li>mdatボックスの後ろにある場合、最初にmoovを取得するために全ファイルをダウンロードする必要が生じ、再生の遅延が発生します。</li>
  <li>moovの位置を先頭に移動させるために再度変換処理が必要です。</li>
</ul>

---
layout: default
title: HLSの配信方法
---
# HLSの配信方法
<div class="h1-gradient">
HLSはAdaptive Streamingを実現するためのストリーミングプロトコルです。
</div>

### **セグメントベースのストリーミング**
<ul class="li-text">
  <li>動画を短い時間（通常2〜10秒）のセグメントに分割し、各セグメントは個別のファイルとして配信されます。</li>
  <li>マニフェストファイル（.m3u8）が全セグメントの場所と再生順序を管理します。</li>
</ul>

<br>

### **特徴として**
<ul class="li-text">
  <li>異なる帯域幅に対応する複数の品質レベルを提供することが可能です。</li>
  <li>クライアントは自動的にネットワーク状況に応じて最適な品質を選択できます。</li>
</ul>

---
layout: default
title: HLSのファイル構造と注意点
---
### **HLSの構造**
HLSは、以下のようなファイル構造を持っています。
<ul class="li-text">
  <li><strong>マスタープレイリスト</strong>: 利用可能な品質（解像度・ビットレート）のリスト</li>
  <li><strong>メディアプレイリスト</strong>: 各品質ストリームのセグメントリスト</li>
  <li><strong>セグメントファイル</strong>: 実際の動画データ（通常.tsまたは.fmp4形式）</li>
</ul>
<br>

```mermaid
flowchart TD
    A[マスタープレイリスト<br>master.m3u8] --> B[メディアプレイリスト<br>高画質<br>high.m3u8]
    A --> C[メディアプレイリスト<br>中画質<br>medium.m3u8]
    
    B --> B1[high_0.ts]
    B --> B2[high_1.ts]
    B --> B3[high_2.ts]
    B --> B4[...]
    
    C --> C1[medium_0.ts]
    C --> C2[medium_1.ts]
    C --> C3[medium_2.ts]
    C --> C4[...]
    
    subgraph "セグメントファイル (高画質)"
        B1
        B2
        B3
        B4
    end
    
    subgraph "セグメントファイル (中画質)"
        C1
        C2
        C3
        C4
    end
```

---
layout: default
title: DRMについて
---

# DRMについて
<div class="h1-gradient">
よくある動画配信サービス（HuluやNetfrixなど）はDRM（デジタル保護管理）の技術を使っています。
動画をダウンロードしたり、画面録画した場合でも黒塗りになるようDRM方式でデータを暗号化しています。
</div>

### **DRMサービス**
一般的にはDRM認証サービスを導入します。
Googleが提供している[Widevine DRM](https://www.widevine.com/solutions/widevine-drm)が有名

### **導入方法として、**
ざっくり下記手順が必要となり、かなりハードルが高いです。[参考URL](https://www.multidrmkit.net/blog/how-to-widevine)
<ul class="li-text">
  <li>Widevineパートナーになる</li>
  <li>Widevineの利用を開始する</li>
  <li>動画を暗号化</li>
</ul>
---
layout: default
title: まとめ
---

# まとめ

### **配信フォーマットの選択**
<ul class="li-text">
  <li>シンプルな配信はMP4</li>
  <li>複数解像度対応にはHLS/DASH</li>
  <li>コンテンツ保護にはDRM導入を検討</li>
</ul>
<br>

### **MP4配信時**
「moovボックス」の位置に注意し、ファイル先頭配置を推奨

### **HLS配信**
ネットワーク状況に応じた最適な品質を提供可能

### **DRM導入**
技術的ハードルが高いので、外部サービスを検討

---
layout: end
---
ご清聴ありがとうございました