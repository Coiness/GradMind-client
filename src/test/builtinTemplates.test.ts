import { describe, it, expect } from "vitest";
import { templates } from "@/config/workflows/index";

describe("内置预设场景测试", () => {
  it("应该导出精简后的 4 个场景", () => {
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBe(4);
  });

  it("每个模板都应该有必要字段", () => {
    templates.forEach((tpl) => {
      expect(tpl.id).toBeDefined();
      expect(tpl.name).toBeDefined();
      expect(tpl.nodes).toBeDefined();
      expect(Array.isArray(tpl.nodes)).toBe(true);
      expect(tpl.edges).toBeDefined();
      expect(Array.isArray(tpl.edges)).toBe(true);
    });
  });
});

describe("场景1：气温波动拟合对比", () => {
  const tpl = templates.find((t) => t.id === "scene-temperature-regression")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("Dataset 节点应该内置连续气温数据", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    expect(datasetNode).toBeDefined();
    const data = datasetNode!.data.datasetData?.data as number[][];
    expect(data).toBeDefined();
    expect(data.length).toBe(500);
  });

  it("应该有两个示波器节点", () => {
    const oscNodes = tpl.nodes.filter((n) => n.type === "oscilloscope");
    expect(oscNodes.length).toBe(2);
  });
});

describe("场景2：高维特征分类 (PCA 降维)", () => {
  const tpl = templates.find((t) => t.id === "scene-highdim-pca")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("PCA 节点应该配置 targetDimension: 2", () => {
    const pcaNode = tpl.nodes.find((n) => n.data.algorithmKey === "pca");
    expect(pcaNode).toBeDefined();
    expect(pcaNode!.data.parameters?.targetDimension).toBe(2);
  });

  it("应该有两个示波器节点", () => {
    const oscNodes = tpl.nodes.filter((n) => n.type === "oscilloscope");
    expect(oscNodes.length).toBe(2);
  });
});

describe("场景3：SVD 图像压缩", () => {
  const tpl = templates.find((t) => t.id === "scene-svd-image-compression")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("应该包含 SVD 和图像重建算子", () => {
    const svdNode = tpl.nodes.find((n) => n.data.algorithmKey === "svd");
    const reconNode = tpl.nodes.find(
      (n) => n.data.algorithmKey === "image-reconstruction",
    );
    expect(svdNode).toBeDefined();
    expect(reconNode).toBeDefined();
  });
});

describe("场景4：梯度下降寻找谷底", () => {
  const tpl = templates.find((t) => t.id === "scene-gradient-descent")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("应该配置了 objectiveFunction 为 bowl", () => {
    const gdNode = tpl.nodes.find(
      (n) => n.data.algorithmKey === "gradient-descent",
    );
    expect(gdNode).toBeDefined();
    expect(gdNode!.data.parameters?.objectiveFunction).toBe("bowl");
  });
});
