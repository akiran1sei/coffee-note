declare const html2pdf: (
  element?: HTMLElement,
  opt?: any
) => {
  set(opt: any): any;
  from(element: HTMLElement): any;
  save(filename?: string): any;
  // 必要に応じて、他の関数やプロパティの型定義を追加します
};
