class PrivateNas < Formula
  desc "Self-hosted secure cloud solution for macOS"
  homepage "https://github.com/your-username/private-nas"
  url "https://github.com/your-username/private-nas/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "checksum_of_tarball"
  license "MIT"

  depends_on "docker"
  depends_on "docker-compose"
  depends_on "node" => :build
  depends_on "openjdk@21" => :build # or 25 if available

  def install
    # 1. Install all files to prefix
    prefix.install Dir["*"]

    # 2. Bin wrapper is already prepared in bin/private-nas
    # Modify it to point to the installed prefix? 
    # The script uses relative paths resolution so it handles symlinks correctly.
    
    # 3. Expose the binary
    bin.install_symlink prefix/"bin/private-nas"
  end

  def post_install
    puts "Run 'private-nas start' to initialize and run the service."
  end

  test do
    system "#{bin}/private-nas", "help"
  end
end
