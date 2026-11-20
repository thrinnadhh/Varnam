"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getCategoryTreeAdmin,
  upsertCategoryNode,
  deleteCategoryNode,
  reorderCategoryNodes,
  type NavigationNode,
} from "@/lib/db/actions";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<NavigationNode[]>([]);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal / Form state for Add or Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [showInNav, setShowInNav] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const loadData = () => {
    getCategoryTreeAdmin()
      .then((data) => setTree(data || []))
      .catch((err) => {
        console.error("Failed to load category tree:", err);
        setFeedback({ type: "error", message: "Failed to load category hierarchy." });
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateSubheading = () => {
    setEditingNodeId(null);
    setParentId(null);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(tree.length);
    setShowInNav(true);
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openCreateChild = (parent: NavigationNode) => {
    setEditingNodeId(null);
    setParentId(parent.id);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(parent.children.length);
    setShowInNav(true);
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEdit = (node: NavigationNode, parentNodeId: string | null = null) => {
    setEditingNodeId(node.id);
    setParentId(parentNodeId);
    setName(node.name);
    setSlug(node.slug);
    setDescription(node.description || "");
    setSortOrder(node.sort_order);
    setShowInNav(node.show_in_nav);
    setIsActive(node.is_active);
    setIsFormOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingNodeId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Category name is mandatory." });
      return;
    }

    startTransition(async () => {
      const res = await upsertCategoryNode({
        id: editingNodeId || undefined,
        parent_id: parentId,
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: description.trim() || undefined,
        sort_order: sortOrder,
        is_active: isActive,
        show_in_nav: showInNav,
        segment: "all",
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: editingNodeId
            ? `Category "${name}" updated. Storefront navigation and filters updated immediately!`
            : `New category "${name}" published!`,
        });
        setIsFormOpen(false);
        loadData();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to save category." });
      }
    });
  };

  const handleDelete = (id: string, categoryName: string, isParent: boolean) => {
    const promptMsg = isParent
      ? `Are you sure you want to delete storefront subheading "${categoryName}"?\n\nDeleting this subheading will completely remove it and its dropdown options from the storefront menu. Any products linked to it will remain safe with category set to null.`
      : `Are you sure you want to delete clothing type "${categoryName}" from the dropdown menu?\n\nIt will be permanently removed from navigation. Existing products will not be lost.`;

    if (!confirm(promptMsg)) return;

    startTransition(async () => {
      const res = await deleteCategoryNode(id);
      if (res.success) {
        setFeedback({
          type: "success",
          message: `"${categoryName}" deleted. Storefront navigation refreshed.`,
        });
        loadData();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to delete category." });
      }
    });
  };

  const handleReorderSubheadings = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= tree.length) return;

    const newTree = [...tree];
    const [moved] = newTree.splice(index, 1);
    newTree.splice(targetIdx, 0, moved);

    const reorderedIds = newTree.map((n) => n.id);
    setTree(newTree);

    startTransition(async () => {
      const res = await reorderCategoryNodes(reorderedIds);
      if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Failed to save order." });
        loadData();
      }
    });
  };

  const handleReorderChildren = (
    parentIndex: number,
    childIndex: number,
    direction: "up" | "down"
  ) => {
    const parent = tree[parentIndex];
    if (!parent) return;

    const targetIdx = direction === "up" ? childIndex - 1 : childIndex + 1;
    if (targetIdx < 0 || targetIdx >= parent.children.length) return;

    const newChildren = [...parent.children];
    const [moved] = newChildren.splice(childIndex, 1);
    newChildren.splice(targetIdx, 0, moved);

    const newTree = [...tree];
    newTree[parentIndex] = { ...parent, children: newChildren };
    setTree(newTree);

    const reorderedIds = newChildren.map((c) => c.id);
    startTransition(async () => {
      const res = await reorderCategoryNodes(reorderedIds);
      if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Failed to save order." });
        loadData();
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/10 text-rose-900 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront Information Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Dynamic Navigation Subheadings &amp; Clothing Types
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage the top navigation subheadings (center header) and child clothing types shown in dropdowns and collection filters.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateSubheading}
          className="px-4 py-2.5 bg-rose-900 text-white rounded-xl text-xs font-semibold hover:bg-rose-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Storefront Subheading</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* FORM MODAL */}
      {isFormOpen && (
        <form
          onSubmit={handleSave}
          className="p-6 sm:p-8 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-6 text-xs"
        >
          <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-serif">
              {editingNodeId
                ? `Edit ${parentId ? "Clothing Type" : "Storefront Subheading"}`
                : parentId
                ? "Add Clothing Type to Dropdown"
                : "Add New Storefront Subheading"}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-stone-500 hover:text-stone-800 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">Display Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Pattu &amp; Lehengas, or Silk Twirl Frocks"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. pattu-lehengas or silk-frocks"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
              <p className="text-[11px] text-stone-500">
                Maps to: <code className="text-rose-900">/collections/{slug || "slug"}</code>
              </p>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-stone-700">Description / Fabric Craft Note</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Handwoven pure silk with authentic zari borders and cotton lining."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={showInNav}
                  onChange={(e) => setShowInNav(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-900 focus:ring-rose-800"
                />
                <span>Show in Storefront Navigation Header</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-900 focus:ring-rose-800"
                />
                <span>Active (Visible on Storefront)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-rose-900 text-white rounded-xl font-semibold hover:bg-rose-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {isPending ? "Saving..." : editingNodeId ? "Save Changes" : "Create Node"}
            </button>
          </div>
        </form>
      )}

      {/* SUBHEADINGS TREE VIEW */}
      <div className="space-y-6">
        {tree.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl text-stone-500 text-sm">
            No navigation subheadings configured yet. Click &ldquo;+ Add Storefront Subheading&rdquo; to create your first top-level menu.
          </div>
        ) : (
          tree.map((subheading, sIdx) => (
            <div
              key={subheading.id}
              className={`rounded-2xl border bg-white overflow-hidden shadow-sm transition-all ${
                subheading.is_active ? "border-stone-200" : "border-stone-200 opacity-60"
              }`}
            >
              {/* Parent Subheading Row */}
              <div className="p-5 bg-stone-50/80 border-b border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Sequence Reorder */}
                  <div className="flex flex-col gap-1 text-stone-400 shrink-0">
                    <button
                      type="button"
                      disabled={sIdx === 0}
                      onClick={() => handleReorderSubheadings(sIdx, "up")}
                      className="p-1 hover:text-stone-900 hover:bg-stone-200 rounded disabled:opacity-30"
                      title="Move Left in Navigation"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-center font-mono font-bold text-stone-600">
                      {sIdx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={sIdx === tree.length - 1}
                      onClick={() => handleReorderSubheadings(sIdx, "down")}
                      className="p-1 hover:text-stone-900 hover:bg-stone-200 rounded disabled:opacity-30"
                      title="Move Right in Navigation"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-900/10 text-rose-900 px-2 py-0.5 rounded">
                        Storefront Subheading
                      </span>
                      {subheading.show_in_nav && (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          In Center Header
                        </span>
                      )}
                      {!subheading.is_active && (
                        <span className="text-[10px] font-semibold bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif font-bold text-lg text-stone-900 mt-1">
                      {subheading.name}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                      <Link
                        href={`/collections/${subheading.slug}`}
                        target="_blank"
                        className="font-mono text-rose-900 hover:underline flex items-center gap-1"
                      >
                        <span>/collections/{subheading.slug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span>•</span>
                      <span>{subheading.children.length} Dropdown Options</span>
                    </div>
                  </div>
                </div>

                {/* Subheading Controls */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => openCreateChild(subheading)}
                    className="px-3 py-1.5 bg-white border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold hover:bg-stone-100 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-800" />
                    <span>+ Add Clothing Type</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(subheading)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg transition-colors border border-stone-200"
                    title="Rename Subheading"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(subheading.id, subheading.name, true)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                    title="Delete Subheading &amp; Children"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Child Clothing Types List */}
              <div className="p-4 sm:p-5">
                {subheading.children.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-stone-200 text-center text-xs text-stone-500">
                    No child clothing types currently in this dropdown. Click &ldquo;+ Add Clothing Type&rdquo; to add dresses (e.g. Pure Zari Pavadais, Half Sarees).
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {subheading.children.map((child, cIdx) => (
                      <div
                        key={child.id}
                        className="py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {/* Reorder in dropdown */}
                          <div className="flex gap-1 text-stone-400 shrink-0">
                            <button
                              type="button"
                              disabled={cIdx === 0}
                              onClick={() => handleReorderChildren(sIdx, cIdx, "up")}
                              className="p-0.5 hover:text-stone-900 disabled:opacity-20"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={cIdx === subheading.children.length - 1}
                              onClick={() => handleReorderChildren(sIdx, cIdx, "down")}
                              className="p-0.5 hover:text-stone-900 disabled:opacity-20"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

                          <div>
                            <span className="font-bold text-stone-900">{child.name}</span>
                            <div className="flex items-center gap-2 text-[11px] text-stone-500">
                              <Link
                                href={`/collections/${child.slug}`}
                                target="_blank"
                                className="font-mono text-rose-900 hover:underline"
                              >
                                /collections/{child.slug}
                              </Link>
                              {child.description && (
                                <>
                                  <span>•</span>
                                  <span className="line-clamp-1">{child.description}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Child Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEdit(child, subheading.id)}
                            className="p-1 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(child.id, child.name, false)}
                            className="p-1 text-rose-500 hover:text-rose-800 rounded hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
