
// A plugin is a Node module that exports a function which takes a `robot` argument

module.exports = robot => {
  
  
  //variables to be moved here
  
  // Listen for a pull request being opened or synchronized
  robot.on('pull_request', async context => {
    // Just assign a variable to make our life easier
    const pr = context.payload.pull_request;
    const repo = context.payload.repository;
    
    // Get all the commits in the pull request
   const compare = await context.github.repos.compareCommits(context.repo({
      base: pr.base.sha,
      head: pr.head.sha
    }));

    // const passCheck = compare.data.commits.every(data => {
    //   return data.commit.message.match(/DevelopmentBranchTesting/);
    // });
    //This part needs to be fixed to allow access to private git repos
    var fullreponame = repo.full_name;
    var pullnum = pr.number;
    var finalurl = 'https://patch-diff.githubusercontent.com/raw/'+fullreponame+'/pull/'+pullnum+'.diff'
    
    //This needs to be reworked from issues to pull requst
    //const autocomment = context.pulls({body: 'Probot will autocomment when running :D'})
    //context.github.issues.createComment(autocomment)
    
    console.log(finalurl);
    var text;
    //async'ed for getting scripts
    (async (url) => {
      text = await getScript(url);
      //Testing with only console log
      //console.log(text+'+5555555');
      //text = text + '+55555';
      var parse = require('parse-diff');
      var diff = text; // edit this to access the text on the internet site using POST or Get
      var files = parse(diff);

      //This is just a random JSON to jog my memory on how it works
      /*var data = { 
        hello: [1,2,3,4], 
        there: { 
            a:1, 
            b:2, 
            c:["hello", null]
        } 
    };*/

      var PRWhole = [];
      var pullRequestJSON = {};
      var Commit = [];
      var hunk=  {};
      var changeline = [];
      var chunkcount = 0;
      var changelncount = 0;
    // console.log("TEsting The JSON here");
    // console.log(data.hello);
    // console.log("TEsting The JSON here");
    //console.log(files);
      //console.log(files.length); // number of patched files
      console.log(files[0].index[0].slice(files[0].index[0].length-8,files[0].index[0].length)); //This cuts the ID of the commmit 
      
      files.forEach(function(file) {
        chunkcount = 0;
      console.log(file);
      file.chunks.forEach(function(chunk){
        
        chunk.changes.forEach(function(change){
          //console.log(change);
          if(change.type == 'add')
          {
            changeline.push(change.content);
            //Create a JSON OBJ here that takes in all the addition 
            changelncount++;
          }
        });
      
        hunk = {
          "chunknum":chunkcount,
          "startline": chunk.newStart,
          "endline": chunk.newStart+chunk.newLines,
          "filename": file.to,
          "edit": changeline
        };
        Commit.push(hunk);
        chunkcount = chunkcount+1;
        changeline =[];
        changelncount = 0;
      });
      pullRequestJSON = { 
        "commitID":file.index[0].slice(file.index[0].length-8,file.index[0].length),
        "commitData":Commit
      }
      PRWhole.push(pullRequestJSON);
      //console.log(file.chunks.length); // number of chunks
      //console.log(file.chunks[0].changes.length) // chunk added/deleted/context lines
      //console.log(file.deletions); // number of deletions in the patch
      //console.log(file.additions); // number of additions in the patch
      
      
  });
  //console.log((PRWhole));
  const axios = require('axios')
  axios.post('http://localhost:3222', {
  PRWhole
})
.then((res) => {
  console.log(`statusCode: ${res.statusCode}`)
  console.log(res.data)
})
.catch((error) => {
  console.error(error)
})



  })(finalurl);

  //const { exec } = require("child_process");
  //move this up top later with predefined var's 
  /*var val = "ping www.google.com";
  
  exec(val, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
  });*/

    // Parameters for the status API
    console.log("Starting Passcheck Process");
    const paramsStatus = {
      sha: pr.head.sha,
      context: 'Automated state for PR',
      state: passCheck ? 'success' : 'failure',
      //state: 'success',
      description: `Your code has ${passCheck ? 'more' : 'less'} than 50% Pythonic Idioms`
      //description: 'An Automated System for the PR '
    }

    
    //New Params for issues
    /*const params = {
      
      title: 'Issue Created on PullRQ',
      body: 'Automatically Generated',
      
    }*/
    /*const params = {
      owner: 'AGS48353',
      repo: 'TestingRepoNothing',
      path: 'README.md'
    }*/

    //Needed for creating Comments The number is the issuenumber which is shared between issues and PR 
    console.log("Starting Commenting Process");
    const commentparams = {
      owner: repo.owner.login,
      repo: repo.name,
      
      number: pullnum,
      body: 'This version now allows the Bot to comment anything and set a passcheck state for passing or failing the PR '
    }

    // Create the status Depends on what we need
    //Creates the Failed status
    //context.github.repos.createStatus(context.repo(paramsStatus));
    //return context.github.issues.create(context.repo(params));
    //creates the comments on the PR
    //context.github.issues.createComment(context.repo(commentparams));

    /*context.github.repos.getContents({
      owner: 'AGS48353',
      repo: 'TestingRepoNothing',
      path: 'BST/insert.java'
    })
    
      .then(result => {
        // content will be base64 encoded
        const content = Buffer.from(result.data.content, 'base64').toString()
        console.log(content)
      })*/

  
    
  });
};
//This is the script for URL
const getScript = (url) => {
  return new Promise((resolve, reject) => {
      const http      = require('http'),
            https     = require('https');

      let client = http;

      if (url.toString().indexOf("https") === 0) {
          client = https;
      }
      client.get(url, (resp) => {
          let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
              data += chunk;
          });

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
              resolve(data);
          });

      }).on("error", (err) => {
          reject(err);
      });
  });
};