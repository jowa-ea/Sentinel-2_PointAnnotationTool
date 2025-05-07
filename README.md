# Sentinel-2_PointAnnotationTool
A Google Earth Engine based tool for sample unit annotation in GEE


The GoogleEarthEngine (GEE) annotation tool allows to iterate through points to be annotated based on Sentinel-2 imagery. 
The user interface in GEE looks like this:

![image](https://github.com/user-attachments/assets/33457c57-1efb-4b61-af27-6759e341d282)

To the left, by default, the NDVI time series of the point to be annotated is shown (start and end dates for the NDVI time series are to be inputed in the **Project setup** section.

**Layer control**: 
- In the rigth panel, the annotator can choose to uncheck all layers, check all layers and change vizualisation parameters from False colors to True colors and back.
**Point navigation**
- The annotator can also navigate in points to be annotated using previous point, next point and go to point buttons.
**Project setup**
- IN the code all section where user input is requested are commented "_INPUT -> type of input requested_"


