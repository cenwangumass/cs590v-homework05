# cs590v-homework05

## Dataset

The dataset is the directory hierarchy of Linux source code. It is obtained by downloading the source code at [https://github.com/torvalds/linux](https://github.com/torvalds/linux) and analyzing it with Python program. The original dataset contains more than 60,000 nodes. I only include the directories to the second level from the root directory considering D3 may not perform well with so many nodes and edges. It now contains every directory up to second level from the root, their names and the hierarchy of the directories. Additionally, it also has the disk size of these directories and how many files there are in these directories. This visualization can help a novice to Linux source code to quickly get an idea how Linux source code is organized.

## Two Visualizations

The first is a graph showing the source code hierarchy. The second is a scatter plot with each point showing the directory size and number of files in that directory.

## Probing and Selection

I implement two ways of selection. In the graph visualization, you can click on nodes one by one, and the corresponding data points in the scatterplot will be highlighted. In the scatterplot, you can use brush to select multiple data points.

When you hover on a node or a data point in one visualization, the corresponding point is also highlighted in the other visualization.

## Another Interaction

A slider is provided to play with **charge force** parameter.

## Extra Credit

Some comments on how to implement linking between visualizations. In this homework, the most challenging part is to maintain consistent views in different visualizations. I find that the core concept of React, a JavaScript library for writing Web UI is particularly useful. I keep all selected nodes, where the operation happens, etc. all in one `State` object. When the user trigger some events like clicking the button, brushing an area, I send the data to this state object instead of using `d3.selectAll` to highlight the data points all over the place. The state object will re-render the view on my behalf. This is called **_unidirectional data flow_** in React. It is much easier to write the visualization in this way.
