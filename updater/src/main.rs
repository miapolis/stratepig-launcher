#![windows_subsystem = "windows"]

use curl::easy::Easy;
use std::fs::{self, File};
use std::io::{self, Write};
use std::path::Path;
use std::process::Command;

mod secrets;

fn main() {
    Command::new("./launcher/Stratepig.exe").output().unwrap();
    // Run the following code after the executable has closed
    let path = Path::new("./temp");
    if !path.exists() {
        println!("temp dir does not exist");
        return;
    }

    let res = File::open("./temp/launcher.zip");
    if res.is_err() {
        println!("cannot open zip archive in temp dir");
        return;
    }
    // Unzip the contents
    unzip_file(res.unwrap());

    // Delete the temp and old directories
    fs::remove_dir_all(Path::new("./launcher")).unwrap();
    fs::remove_dir_all(Path::new("./temp")).unwrap();
    std::fs::rename("./win-unpacked", "./launcher").unwrap();

    // Get the latest version from the server
    let mut easy = Easy::new();
    let mut data = Vec::new();
    let url = &format!("{}{}", secrets::URL, "/launcher/version");
    easy.url(url).unwrap();
    {
        let mut transfer = easy.transfer();
        transfer
            .write_function(|new_data| {
                data.extend_from_slice(new_data);
                Ok(new_data.len())
            })
            .unwrap();
        transfer.perform().unwrap();
    }
    let body = String::from_utf8(data).expect("Body is not a valid UTF-8 sequence!");

    // Write the version to the file
    let mut file = File::create("launcher-version.txt").unwrap();
    file.write_all(body.as_bytes()).unwrap();

    // Start the process again
    Command::new("./launcher/Stratepig.exe").output().unwrap();
}

fn unzip_file(zipped: File) {
    let mut archive = zip::ZipArchive::new(zipped).unwrap();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {} comment: {}", i, comment);
            }
        }

        if (&*file.name()).ends_with('/') {
            println!("File {} extracted to \"{}\"", i, outpath.display());
            fs::create_dir_all(&outpath).unwrap();
        } else {
            println!(
                "File {} extracted to \"{}\" ({} bytes)",
                i,
                outpath.display(),
                file.size()
            );
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(&p).unwrap();
                }
            }
            let mut outfile = fs::File::create(&outpath).unwrap();
            io::copy(&mut file, &mut outfile).unwrap();
        }

        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).unwrap();
            }
        }
    }
}
