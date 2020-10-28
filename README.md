[logo]: ./images/CloudScout_logo.jpg
![alt text][logo]

# About Cloud Scout
Cloud Scout is a plugin which works on top of [BloodHound](https://github.com/BloodHoundAD/BloodHound), leveraging its visualization capabilities in order to visualize cross platform attack paths.

Link to our White Paper: [link](https://sygnia.co/cloudscout)

At this point Cloud Scout supports two frameworks [AWSPX](https://github.com/FSecureLABS/awspx) and [StormSpotter](https://github.com/Azure/Stormspotter).

Cloud Scout is able to ingest output of the mentioned frameworks into one unified database and on top of that the plugin will create relation between relevant nodes based on thier attributes.

Cloud Scout is developed by [@OlegLerner](https://twitter.com/OlegLerner), [@DVazgiel](https://twitter.com/DVazgiel) and [@IliaRabinovich](https://twitter.com/IliaRabinovich) from [Sygnia](https://sygnia.co/).

# Installation
In order to install the plugin download the GitHub repository and execute the included batch installation script with a path to BloodHound.exe as a command line argument (Assuming you already have BloodHound installed).

Example:
```batch
install.bat C:\project\BloodHound
```

### Dependencies
Cloud Scout has a few dependencies related to the installation.
- [BloodHound](https://github.com/BloodHoundAD/BloodHound)
- [git](https://git-scm.com/)
- python
- pipenv

In our experience for environments with about ~2 million relations and hundereds of thousands of nodes, for optimal performance it is recommended to use a machine with 16GB RAM

# Examples
Full Domain compromise leveraging Azure

[example1]: ./images/e1.jpg
![alt text][example1]

AWS take over leveraging Azure and AWS permissions

[example2]: ./images/e2.jpg
![alt text][example2]

Network data mapping

[example3]: ./images/e3.jpg
![alt text][example3]

# License
[MIT](./LICENSE.md)