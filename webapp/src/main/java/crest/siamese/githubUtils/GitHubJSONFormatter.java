package crest.siamese.githubUtils;

import com.siamesex.standalone.model.HunkResult;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class GitHubJSONFormatter {

    JSONArray jIdiomaticHunks, jNonidiomaticHunks, jCommits;
    JSONObject jPullRequest;

    public GitHubJSONFormatter() {
        this.jIdiomaticHunks = new JSONArray();      // Array of idiomatic chunks per one commit
        this.jNonidiomaticHunks = new JSONArray();   // Array of nonidiomatic chunks per one commit
        this.jCommits = new JSONArray();        // Array of commits per one pull request
        this.jPullRequest = new JSONObject();     // The pull request

    }

    public void addHunktoArray(JSONObject hunkResult) {

         if (hunkResult.get("idiomatic").equals("true")) {
             jIdiomaticHunks.add(hunkResult);
         } else {
             jNonidiomaticHunks.add(hunkResult);
         }

    }

    public void addCommittoArray(JSONObject commitResult) {
        jCommits.add(commitResult);
    }

    public JSONObject createHunkResult(HunkResult r) {

        JSONObject item = new JSONObject();

        String file = r.getFileName().split(".py_")[0];

        item.put("chunknum", String.valueOf(r.getHunkNum()));
        item.put("filename", file);
        item.put("startline", String.valueOf(r.getStartLine()));
        item.put("endline", String.valueOf(r.getEndLine()));
        item.put("source", r.getSource());
        item.put("idiomatic", String.valueOf(r.isIdiomatic()));
        item.put("recommend", r.getRecommendIdiom());

        return item;
    }

    public JSONObject createCommitResult(String commitID, JSONArray hunks) {

        JSONObject item = new JSONObject();

        item.put("commitID", commitID);
        item.put("commitData", hunks);

        return item;

    }

    public JSONObject createPullRequestResult(JSONArray commitsResults) {

        this.jPullRequest.put("PRCommits", jCommits);

        return jPullRequest;
    }

    public JSONArray getjCommitsResult() {
        return this.jCommits;
    }

    public String getJSONString() {

        jPullRequest.put("commits", jCommits);
        return jPullRequest.toString();
    }


}
