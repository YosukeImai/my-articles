import { defineConfig } from 'unocss';

export default defineConfig({
  // カスタムルールの定義
  rules: [
    ['h1-gradient', {
      'font-size': '1.3em',
      'margin-bottom': '0.5em',
      'background-color': '#000000',
      'background-size': '100%',
      '-webkit-background-clip': 'text',
      '-moz-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      '-moz-text-fill-color': 'transparent'
    }],
    ['li-text', { 'font-size': '1.3em' }],
    ['h2-text', { 'font-size': '1.5em' }],
    ['h3-color', { 'color': '#307690' }],
    ['p-text', { 'font-size': '1.2em' }]
  ],
  // ショートカットの定義
  shortcuts: {
    // 必要に応じてここにショートカットを追加
  },
  // テーマの設定
  theme: {
    // 必要に応じてここにテーマの設定を追加
  }
});
