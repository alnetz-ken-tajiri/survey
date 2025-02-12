import { OrganizationRelationship } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 「ある orgId がトップレベルか？」を判定する関数
export function isTopLevel(
  orgId: string,
  relationships: OrganizationRelationship[]
): boolean {
  // 「descendantId = orgId & depth = 1」の行が存在しなければトップレベル
  return !relationships.some(
    (rel) => rel.descendantId === orgId && rel.depth === 1
  );
}

// リレーション一覧から「トップレベル組織のID」をすべて抽出する関数
export function getTopLevelOrgIds(
  relationships: OrganizationRelationship[]
): string[] {
  // 全組織IDを収集（ancestorId, descendantId からユニークに）
  const allOrgIds = new Set<string>();
  relationships.forEach((rel) => {
    allOrgIds.add(rel.ancestorId);
    allOrgIds.add(rel.descendantId);
  });

  // その中で「トップレベル（=親がいない）」だけを抽出
  return Array.from(allOrgIds).filter((orgId) =>
    isTopLevel(orgId, relationships)
  );
}

// --- ここから「トップレベルがいるかどうか」を判定する例 ---

export function hasTopLevel(relationships: OrganizationRelationship[]): boolean {
  // トップレベルのIDが1つでもあれば true
  return getTopLevelOrgIds(relationships).length > 0;
}
