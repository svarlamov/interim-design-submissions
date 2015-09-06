# System Requirements
1.  *nix or OS X only
2.  NodeJS
3.  `npm` Installed globally ie., you can use, `npm install ______` from the terminal whilst in any directory
4.  MongoDB
5. GraphicsMagick installed, and in PATH

# Installing
1.  To install the Speak server on your box you must first ensure that you meet all of the prerequisites outlined in the 'System Requirements' section. Once you are certain that the server will function on your machine, follow the next few steps to get yourself up and running.
2.  Create a config.js of your own based on the config.default.js provided in the repository
3.  Edit the MongoDB server domain in the `app.js` file to point to your MongoDB instance. This would also be the time to setup any other MongoDB settings that are specific to your installation, such as user accounts and passwords.
4.  (Optional) Edit the `config.js` if you would like to use Amazon S3 file hosting to host user media.
5.  (Optional) Further edit the `app.js` if you would like to change the ports, IP's, etc.
6.  Open up terminal and `cd` into the installation directory, ie., `~/MyFiles/interim-design-submissions`
7.  Execute `npm install`
8.  Execute `bower install`

# Running
### In Debug
To run the server in debug mode, execute the following command while in the installation directory, `DEBUG=interim-design-submissions:* npm start`
### In Production
Although the Speak and Listen server is not production ready yet, you may run it as such by executing the following command while in the installation directory, `npm start`
