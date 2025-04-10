/**
 * 配列の平均値を計算
 */
export function calculateMean(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }
  
  /**
   * 配列の標準偏差を計算
   */
  export function calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0
    const mean = calculateMean(values)
    const squareDiffs = values.map((value) => Math.pow(value - mean, 2))
    const variance = calculateMean(squareDiffs)
    return Math.sqrt(variance)
  }
  
  /**
   * 生の値を偏差値に変換
   * 偏差値 = Zスコア × 10 + 50
   */
  export function calculateDeviation(value: number, mean: number, standardDeviation: number): number {
    if (standardDeviation === 0) return 50
    return ((value - mean) / standardDeviation) * 10 + 50
  }
  
  /**
   * 質問ごとの偏差値を計算
   */
  export function calculateQuestionDeviations(
    data: { questionName: string; numericValue: number }[],
  ): Map<string, { value: number; deviation: number }[]> {
    // 質問ごとにデータをグループ化
    const questionGroups = new Map<string, { value: number; deviation: number }[]>()
  
    // 質問ごとのデータを収集
    data.forEach((item) => {
      if (!questionGroups.has(item.questionName)) {
        questionGroups.set(item.questionName, [])
      }
      questionGroups.get(item.questionName)?.push({
        value: item.numericValue,
        deviation: 0, // 初期値
      })
    })
  
    // 各質問グループで偏差値を計算
    questionGroups.forEach((items, questionName) => {
      const values = items.map((item) => item.value)
      const mean = calculateMean(values)
      const standardDeviation = calculateStandardDeviation(values)
  
      // 各値の偏差値を計算
      items.forEach((item) => {
        item.deviation = calculateDeviation(item.value, mean, standardDeviation)
      })
    })
  
    return questionGroups
  }
  
  /**
   * カテゴリーごとの偏差値を計算
   */
  export function calculateCategoryDeviations(
    data: { category: string; numericValue: number }[],
  ): Map<string, { value: number; deviation: number }[]> {
    // カテゴリーごとにデータをグループ化
    const categoryGroups = new Map<string, { value: number; deviation: number }[]>()
  
    // カテゴリーごとのデータを収集
    data.forEach((item) => {
      if (!categoryGroups.has(item.category)) {
        categoryGroups.set(item.category, [])
      }
      categoryGroups.get(item.category)?.push({
        value: item.numericValue,
        deviation: 0, // 初期値
      })
    })
  
    // 各カテゴリーグループで偏差値を計算
    categoryGroups.forEach((items, category) => {
      const values = items.map((item) => item.value)
      const mean = calculateMean(values)
      const standardDeviation = calculateStandardDeviation(values)
  
      // 各値の偏差値を計算
      items.forEach((item) => {
        item.deviation = calculateDeviation(item.value, mean, standardDeviation)
      })
    })
  
    return categoryGroups
  }
  
  /**
   * 全体の偏差値を計算
   */
  export function calculateOverallDeviations(data: { numericValue: number }[]): { value: number; deviation: number }[] {
    const values = data.map((item) => item.numericValue)
    const mean = calculateMean(values)
    const standardDeviation = calculateStandardDeviation(values)
  
    return data.map((item) => ({
      value: item.numericValue,
      deviation: calculateDeviation(item.numericValue, mean, standardDeviation),
    }))
  }
  
  // 以下の関数を追加
  /**
   * 選択された質問に基づいて偏差値を再計算
   */
  export function recalculateDeviations(
    data: { questionName: string; numericValue: number }[],
    selectedQuestions: string[],
  ): { questionName: string; numericValue: number; recalculatedDeviation: number }[] {
    // 選択された質問のデータのみをフィルタリング
    const filteredData =
      selectedQuestions.length > 0 ? data.filter((item) => selectedQuestions.includes(item.questionName)) : data
  
    // 数値データを抽出
    const numericValues = filteredData.map((item) => item.numericValue)
  
    // 平均と標準偏差を計算
    const mean = calculateMean(numericValues)
    const standardDeviation = calculateStandardDeviation(numericValues)
  
    // 偏差値を再計算
    return filteredData.map((item) => ({
      ...item,
      recalculatedDeviation: calculateDeviation(item.numericValue, mean, standardDeviation),
    }))
  }
  
  /**
   * カテゴリーごとの偏差値を再計算
   */
  export function recalculateCategoryDeviations(
    data: { category: string; numericValue: number }[],
    selectedQuestions: string[],
  ): Map<string, { value: number; deviation: number }[]> {
    // 選択された質問のデータのみをフィルタリング
    const filteredData =
      selectedQuestions.length > 0 ? data.filter((item) => selectedQuestions.includes(item.category)) : data
  
    // カテゴリーごとにデータをグループ化
    const categoryGroups = new Map<string, { value: number; deviation: number }[]>()
  
    // カテゴリーごとのデータを収集
    filteredData.forEach((item) => {
      if (!categoryGroups.has(item.category)) {
        categoryGroups.set(item.category, [])
      }
      categoryGroups.get(item.category)?.push({
        value: item.numericValue,
        deviation: 0, // 初期値
      })
    })
  
    // 各カテゴリーグループで偏差値を計算
    categoryGroups.forEach((items, category) => {
      const values = items.map((item) => item.value)
      const mean = calculateMean(values)
      const standardDeviation = calculateStandardDeviation(values)
  
      // 各値の偏差値を計算
      items.forEach((item) => {
        item.deviation = calculateDeviation(item.value, mean, standardDeviation)
      })
    })
  
    return categoryGroups
  }
  
  