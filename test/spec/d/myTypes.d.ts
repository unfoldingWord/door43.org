
let myLog: MyLog;

interface MyLog {
    commit_id: string;
    repo_owner: string;
    repo_name: string;
    created_at: Date;
    errors: string[];

}

let project: MyProject;

interface MyProject {
    commits: string[];
}
