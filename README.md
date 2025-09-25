# scPECA Software Tutorial (Quick Start)

> This README is rendered in **Software** page. Replace with your full tutorial.

## 1. Installation
```bash
conda create -n scpeca python=3.10 -y
conda activate scpeca
pip install scpeca
```

## 2. Inputs
- Paired bulk RNA & ATAC **or**
- Unpaired scRNA & scATAC **or**
- sc-multiome
- Sample/cell metadata, genome annotation

## 3. Build a GRN
```bash
scpeca build   --rna rna_matrix.h5ad   --atac atac_matrix.h5ad   --meta meta.tsv   --out out_grn/
```

## 4. Outputs
- `edges.tsv` (regulator, target, weight)
- `nodes.tsv` (gene, annotation)
- `qc/` reports
- `figures/` diagnostics

## 5. Reproducibility
- software version
- command line & parameters
- random seed and environment snapshot
