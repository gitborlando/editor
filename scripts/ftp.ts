import AdmZip from 'adm-zip'
import { Client as FTPClient } from 'basic-ftp'
import { NodeSSH } from 'node-ssh'

const ftpHost = process.env.FTP_HOST
const ftpUser = process.env.FTP_USERNAME
const ftpPass = process.env.FTP_PASSWORD
const sshPass = process.env.SSH_PASSWORD

async function zipFolder(folderPath: string, zipPath: string) {
  const zip = new AdmZip()
  zip.addLocalFolder(folderPath)
  zip.writeZip(zipPath)
}

async function uploadViaFTP(localFile: string, remoteFile: string) {
  const client = new FTPClient()
  await client.access({
    host: ftpHost,
    user: ftpUser,
    password: ftpPass,
    secure: false,
  })
  await client.ensureDir('./')
  await client.uploadFrom(localFile, `./${remoteFile}`)
  client.close()
}

async function unzipViaSSH() {
  const ssh = new NodeSSH()
  await ssh.connect({
    host: ftpHost,
    username: 'root',
    password: sshPass,
  })

  const remoteDir = '/www/wwwroot/editor.gitborlando.com'
  const command = `cd ${remoteDir} && unzip -o dist.zip && rm dist.zip`
  await ssh.execCommand(command)

  ssh.dispose()
}

async function main() {
  zipFolder('./dist', './dist.zip')

  await uploadViaFTP('./dist.zip', 'dist.zip')
  console.log('✅ 上传完成，开始远程解压')

  await unzipViaSSH()
  console.log('✅ 解压完成')
}

main()
