export type GitHubListEntry = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
  url: string;
  download_url: string | null;
};

const DEFAULT_OWNER = 'bob-stewart';
const DEFAULT_REPO = 'meshcore';
const DEFAULT_BRANCH = 'main';

export function meshcoreRef() {
  const owner = import.meta.env.VITE_MESHCORE_OWNER || DEFAULT_OWNER;
  const repo = import.meta.env.VITE_MESHCORE_REPO || DEFAULT_REPO;
  const branch = import.meta.env.VITE_MESHCORE_BRANCH || DEFAULT_BRANCH;
  return { owner, repo, branch };
}

export async function ghListDir(dirPath: string): Promise<GitHubListEntry[]> {
  const { owner, repo, branch } = meshcoreRef();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  });
  if (!res.ok) {
    throw new Error(`GitHub list failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error('Expected directory listing array');
  return json as GitHubListEntry[];
}

export async function ghFetchJson<T>(filePath: string): Promise<T> {
  const { owner, repo, branch } = meshcoreRef();
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return (await res.json()) as T;
}
