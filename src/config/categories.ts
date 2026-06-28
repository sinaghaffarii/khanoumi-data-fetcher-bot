export interface CategoryConfig {  /** نام فولدری که عکس‌ها توش ذخیره میشن */
  folderName: string;
  /** شناسه دسته‌بندی در API */
  catId: number;
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  // personalCare: {
  //   folderName: "بهداشت-شخصی",
  //   catId: 370,
  // },
  // skinCare: {
  //   folderName: "مراقبت-از-پوست",
  //   catId: 27,
  // },
  makeup: {
    folderName: "مراقبت-و-زیبایی-مو",
    catId: 58,
  },
  personalHygiene: {
    folderName: "بهداشت-شخصی",
    catId: 370,
  },
};
