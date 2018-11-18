const cp = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const {shell} = require('electron')
const {AutoLanguageClient, DownloadFile} = require('atom-languageclient')


const serverLauncher = '/plugins/lsp-javac-0.1.0.jar'

class JavaLanguageClient extends AutoLanguageClient {
  /* In order for an AutoLanguageClient to work, it has to have
  getGrammarScopes(), getLanguageName, getServerName(),
  and startServerProcess() */
  getGrammarScopes () { return [ 'source.java' ] }
  getLanguageName () { return 'Java' }
  getServerName () { return 'CheckerFramework LSP' }

  constructor () {
    super()
    this.statusElement = document.createElement('span')
    this.statusElement.className = 'inline-block'

    /* For Debugging Purpose */
    // console.log("Starting LSP...")
    // console.log(this.getExecutableCommand())
    // console.log(this.getExecutableArgs())
    // console.log(path.join(__dirname, '..', 'server'))
    // console.log(atom.project.getPaths()[0].toString())

    this.commands = {
      'java.ignoreIncompleteClasspath': () => { atom.config.set('ide-java.errors.incompleteClasspathSeverity', 'ignore') },
      'java.ignoreIncompleteClasspath.help': () => { shell.openExternal('https://github.com/atom/ide-java/wiki/Incomplete-Classpath-Warning') }
    }
  }

  startServerProcess (projectPath) {
    console.log("Starting LSP...")
    console.log(this.getExecutableCommand())
    console.log(this.getExecutableArgs())
    console.log(path.join(__dirname, '..', 'server'))
    console.log(atom.project.getPaths()[0].toString())
    const config = { 'win32': 'win', 'darwin': 'mac', 'linux': 'linux' }[process.platform]
    if (config == null) {
      throw Error(`${this.getServerName()} not supported on ${process.platform}`)
    }

    /* NodeJS server diretory */
    const serverHome = path.join(__dirname, '..', 'server')
    const command = this.getExecutableCommand()
    const args = [];
    args = this.getExecutableArgs()
    const options = this.getExecutableOptions()

    const childProcess = cp.spawn(command, args, {cwd: options});
    this.logger.debug(`starting "${command} ${args.join(' ')}"`)
    return childProcess;
  }

  
  getExecutableCommand() {
    let binName = /^win/.test(process.platform) ? 'java.exe' : 'java'
    let javaHomeCandidates = [atom.config.get('ide-java.javaHome'),
      process.env['JDK_HOME'],
      process.env['JAVA_HOME']]

    let result = javaHomeCandidates.find((candidate) => {
      if (!candidate) return false;
  
      return fs.existsSync(path.join(candidate, 'bin', binName))
    });

    if (result) return path.join(result, 'bin', binName)

    result = process.env['PATH'].split(path.delimiter).find((candidate) => {
      if (!candidate) return false;
  
      return fs.existsSync(path.join(candidate, binName))
    })

    return path.join(result, binName)
  }

  getExecutableArgs() {
    let frameworkPath = atom.config.get('ide-java.checker-framework.frameworkPath')
    let checkerPath = `${frameworkPath}/checker/dist/checker.jar`
    let fatJarPath = `${__dirname}/libs/lsp-javac-0.1.0.jar`
    let classpath = `.:${checkerPath}:${fatJarPath}`
    let mainClass = 'org.checkerframework.LanguageServerStarter'
    return ['-cp', classpath, mainClass]
  }

  getExecutableOptions() {
    return atom.project.getPaths()[0].toString()
  }
}

module.exports = new JavaLanguageClient()
