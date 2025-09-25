# scPECA

- [scPECA](#scpeca)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Run scPECA](#run-scpeca)
    - [Input](#input)
      - [Format 1](#format-1)
      - [Format 2](#format-2)
      - [Format 3](#format-3)
      - [Format 4](#format-4)
    - [Prior files](#prior-files)
    - [Run example](#run-example)
    - [Output](#output)
    - [GRN Analysis Tools (example cell line: K562)](#grn-analysis-tools-example-cell-line-k562)
      - [TFTG co-module analysis:](#tftg-co-module-analysis)
      - [TF layering](#tf-layering)
  - [System \& Software Requirements](#system--software-requirements)
  - [Considerations](#considerations)
## Introduction
This is a python version of PECA2 gene regulatory 
network construction software designed for single-cell data.
It has a faster running speed and a lower memory footprint.

## Installation
```commandline
pip install scPECA==2.0
```

## Run scPECA
### Input
scPECA requires to input the paired (sc)RNA-seq and (sc)ATAC-seq data,
and it provides data pre-processing in some formats. 
(Pre-processing can also be done manually by the user)
#### Format 1
Paired bulk RNA-seq and ATAC-seq count data

sample_name_RNA.txt

<table>
    <tr>
  		<td>gene1</td> 
        <td>10</td>
    </tr>
    <tr>
        <td>gene2</td> 
        <td>3</td>
    </tr>
</table>

sample_name_ATAC.txt


<table>
    <tr>
  		<td>chr1_10000_10100</td> 
        <td>1</td>
    </tr>
    <tr>
        <td>chr1_20000_20100 </td> 
        <td>0</td>
    </tr>
</table>

#### Format 2
scRNA-seq count data and scATAC-seq count data within the same cluster
without meta information

sample_name_scRNA.csv

|        | barcode1 | barcode2 |
|--------|----------|----------|
| gene1  | 1        | 19       |
| gene2  | 3        | 6        |

sample_name_scATAC.csv

|                  | barcode1 | barcode2 |
|------------------|----------|----------|
| chr1_10000_10100 | 1        | 0        |
| chr1_20000_20100 | 0        | 1        |

#### Format 3
scRNA-seq count data and scATAC-seq count data 
with meta information

sample_name_scRNA.csv

|        | barcode1 | barcode2 |
|--------|----------|----------|
| gene1  | 1        | 19       |
| gene2  | 3        | 6        |

sample_name_scRNA_meta.csv

<table>
    <tr>
  		<td>barcode1</td> 
        <td>celltype1</td>
    </tr>
    <tr>
        <td>barcode2</td> 
        <td>celltype2</td>
    </tr>
</table>

sample_name_scATAC.csv

|                  | barcode1 | barcode2 |
|------------------|----------|----------|
| chr1_10000_10100 | 1        | 0        |
| chr1_20000_20100 | 0        | 1        |

sample_name_scATAC_meta.csv

<table>
    <tr>
  		<td>barcode1</td> 
        <td>celltype1</td>
    </tr>
    <tr>
        <td>barcode2</td> 
        <td>celltype2</td>
    </tr>
</table>

#### Format 4
h5ad scRNA file with cell label




### Prior files

If you are the first time to run scPECA, please download the prior files as follows,

```
from scPECA.prior_install import figshare_download
import os 
import scPECA
figshare_download(os.path.join(os.path.dirname(scPECA.__file__),'Prior.tar.gz'))

```

### Run example


```commandline
from scPECA.scPECA_main import scPECAclass
import scPECA
import os

# example 1
pkg_path = os.path.dirname(scPECA.__file__)
# demo data path
data_path = os.path.join(os.path.dirname(scPECA.__file__), 'Cones')
demo = scPECAclass(data_path, 'Cones', 'hg38', pkg_path) # Create a scPECA class
demo.RNA_process(2) # Format 2 RNA data processing
demo.ATAC_process(2) # Format 2 ATAC data processing
demo.network('Cones', data_path) # PECA2 GRN construction

# example 2
data_path = os.path.join(os.path.dirname(scPECA.__file__), '4cellline')
demo = scPECAclass(data_path, '4cellline', 'hg38', pkg_path)
demo.RNA_process(3) 
demo.ATAC_process(3)

# example 3
data_path = os.path.join(os.path.dirname(scPECA.__file__), 'paul15')
demo = scPECAclass(data_path, 'paul15', 'mm10', pkg_path)
demo.RNA_process(4, 'paul15_clusters') 
```

The details of other optional parameters can be viewed in python. All sample data has been downloaded with the software package.

### Output 
sample_name_network.txt

TFTG_regulationScore.txt

### GRN Analysis Tools (example cell line: K562)


1. TFTG co-module analysis:

```
demo.co_module(celltype, num_clusters)
```
Result: TFmodule_result.txt, TGmodule_result.txt, co_module.png

![image](co-module.png)

2. TF layering
```
demo.tf_layer(celltype)
demo.top_tf_layer_plot(celltype)
```
Result: TF_layer.txt, top_TF_layer_graph.png

![image](top_TF_layer_graph.png)


## System & Software Requirements
System: linux

Linux software: Homer

Python package: pybedtools, ismember, scipy, numpy_groupies, 

## Considerations

1. RNA data preprocessing currently supports only hg38, hg19, mm10, mm9 genomes.
2. pybedtools may not support the latest version of 
python and will require the creation of a new environment.


