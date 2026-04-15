"use client";

import React from "react";
import type { TableColumn } from "../_types";
import EmptyState from "./EmptyState";

interface TableProps<T extends { id: string }> {
  columns: TableColumn<T>[];
  data: T[];
  emptyTitle?: string;
  emptyDescription?: string;
  onAdd?: () => void;
}

export default function Table<T extends { id: string }>({
  columns,
  data,
  emptyTitle = "No data",
  emptyDescription = "There are no items to display yet.",
  onAdd,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={onAdd ? "Add new" : undefined}
          onAction={onAdd}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/50 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={`${item.id}-${String(col.key)}`}
                    className="px-5 py-3.5 text-gray-700 whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(item)
                      : col.key !== "actions"
                        ? String((item as Record<string, unknown>)[col.key as string] ?? "")
                        : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
        <p className="text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{data.length}</span>{" "}
          {data.length === 1 ? "item" : "items"}
        </p>
      </div>
    </div>
  );
}
