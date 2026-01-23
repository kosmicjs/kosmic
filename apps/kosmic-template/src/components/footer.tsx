export default function Footer() {
  return (
    <footer className="w-100 h-25 bg-gradient p-2">
      <div class="row">
        <div class="col text-center">
          <a
            href="https://github.com/kosmicjs/kosmic"
            class="p-1 text-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="bi bi-github fs-3"></i>
            <span class="ps-2">GitHub</span>
          </a>
        </div>
        <div class="col text-center">
          <a href="/docs" class="p-1 text-secondary">
            Docs
          </a>
        </div>
        <div class="col text-center">
          <a href="/account" class="p-1 text-secondary">
            Account
          </a>
        </div>
      </div>
      <div className="text-center mt-3">
        <p>Copyright © 2021 My Website</p>
      </div>
    </footer>
  );
}
