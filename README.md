photo-storage-service
=====================

This is a work-in-progress service aimed to provide APIs to allow for simple and efficient storage of photos.

After cloning the repo, execute the following commands in the project directory:

    1. npm install
    2. npm install -g mongodb

This will install all necessary dependencies, as well as to install mongodb globally. All DB files will be saved by default to /data/db, and the server code provided by this repo will create a db instance named photoTest2 there. If you wish to connect to a non-local MongoDB, you will have to edit the appropriate connection line in server.js. For more information, please see the npm and/or mongodb documentation.
Because the APIs and their functionalities are not yet complete, please note that it is highly recommended that a clean npm install is run every time you update your local repo.


To start up the database, in a terminal window type:

    1. mongod
  
In another terminal window, execute the following command:

    1. node server.js webapp  
Where 'webapp' is the path to the homepage of your web application. If you wish to simply try out the provided test page, 'webapp' should be "./mockpage/index.html" (without quotations).

To view the page, navigate to localhost:3000 in your favourite browser.


Currently the only APIs with any functionality are the following:

    1. Single GET (/api/users/{userId}/photos/{photoId})
        This will serve up a base64-encoded test jpeg image (as provided in testUploads) for use in the web application. Currently, the only working path is /api/users/1/photos/1 - all other requests will return a 400 response.
        
    2. Single POST (/api/users/{userId}/photos)
        This will accept a photo (or any file, really) that is submitted via a form and save a Photo object to the DB, as well as to save the photo in ./testUploads. Please note that this currently ONLY works when submitting an html form, with property "enctype=multipart/form-data". Currently, the only working path is /api/users/1/photos - all other requests will return a 400 response.
