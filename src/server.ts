
import express from 'express';
import {Response, Request, NextFunction} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get('/filteredimage', async (req: Request, res: Response, next: NextFunction) => {
    // Validate the existence of the image_url query parameter
    const imageURL: string = req.query.image_url;
    if (!imageURL) {
      return res.status(400).send({
        message: 'An image URL is required: image_url={imageURL}'
      });
    }

    let localImagePath: string = '';
    try {
      localImagePath = await filterImageFromURL(imageURL);
    } catch (e) {
      return res.status(500).send({
        message: 'The URL provided could not be proccessed'
      });
    }

    const options: object = {
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };
    return res.sendFile(localImagePath, options, function(error){
      deleteLocalFiles([localImagePath]);
      if (error) {
        next(error);
      }
    });
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();