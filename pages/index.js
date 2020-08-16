import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { BsFiles, BsTrash } from 'react-icons/bs'
import { DiJavascript, DiHtml5, DiCss3, DiPython, DiCodeBadge } from 'react-icons/di'
import { IconContext } from 'react-icons'
import getAppCode from './utils/appCode'

let CodeMirror = null
let editor = null

const getFileIcon = (extn) => {
  switch (extn) {
    case 'js':
    case 'jsx':
      return <DiJavascript />
    case 'html':
      return <DiHtml5 />
    case 'css':
      return <DiCss3 />
    case 'py':
      return <DiPython />
    default:
      return <DiCodeBadge />
  }
}

const getFileMode = (extn) => {
  switch (extn) {
    case 'js':
    case 'jsx':
      return 'javascript'
    case 'html':
      return 'htmlmixed'
    case 'css':
      return 'css'
    case 'py':
      return 'python'
    default:
      return 'htmlmixed'
  }
}

class File {
  constructor(filename) {
    this.name = filename,
      this.code = '',
      this.ext = filename.split('.')[filename.split('.').length - 1],
      this.icon = getFileIcon(this.ext)
  }
}

const createDummyFiles = () => {
  let files = []
  let newFile = new File('Hello World.js')
  newFile.code = `// This program prints Hello, world in JS in the console \n\n console.log("Hello World")`
  files.push(newFile)
  
  newFile = new File('Hello World.py')
  newFile.code = `# This program prints Hello, world in python!\n\nprint('Hello, world!')`
  files.push(newFile)
  
  newFile = new File('Home.jsx')
  newFile.code = getAppCode()

  return files
}

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      require('codemirror/mode/javascript/javascript')
      require('codemirror/mode/python/python')
      require('codemirror/mode/css/css')
      require('codemirror/mode/htmlmixed/htmlmixed')

      CodeMirror = require('codemirror')
      editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        mode: "javascript",
        theme: 'dracula',
        lineNumbers: true,
        readOnly: true
      })

      editor.on('change', (inst) => { setCode(editor.getValue()) })
    }
  }, [])


  const [code, setCode] = useState('')
  const [curFile, setCurFile] = useState(new File('.'))
  const [fileName, setFileName] = useState('')
  const [files, setFiles] = useState([...createDummyFiles()])
  const [showFileInput, setShowFileInput] = useState(false)
  const [showAllFiles, setShowAllFiles] = useState(true)
  const inputRef = useRef()

  const addNewFile = (e) => {
    if (e.keyCode === 27) {
      setShowFileInput(false)
      setFileName('')
    }
    else if (e.keyCode === 13) {
      setShowFileInput(false)
      files.push(new File(fileName))
      setFileName('')
    }
  }

  useEffect(() => { showFileInput ? inputRef.current.focus() : null }, [showFileInput])

  useEffect(() => { if (files.length > 0) editor.setOption('readOnly', false) }, [files])

  useEffect(() => {
    editor.setOption('mode', getFileMode(curFile.ext))
    editor.setValue(curFile.code)
  }, [curFile])

  const onAddFileClick = e => {
    setShowFileInput(true)
  }

  const onFileClick = (e, file) => {
    if (curFile.name === file.name) {
      return
    }
    curFile.code = editor.getValue()
    setFiles(files.map((file) => file.name === curFile.name ? curFile : file))
    setCurFile(file)
  }

  const delFile = (e, fileToDel) => {
    if (curFile.name === fileToDel.name) {
      editor.getValue('')
      setCurFile(new File('.'))
    }
    setFiles(files.filter(file => file.name !== fileToDel.name))
  }

  return (
    <div>
      <Head>
        <title>Editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ flexDirection: 'row', display: 'flex', height: '100vh' }}>
        <div style={{ width: '4%', backgroundColor: '#e8eaed', padding: '5px', display: 'flex', justifyContent: 'center' }}>
          <IconContext.Provider value={{ size: '2.5rem', style: { cursor: 'pointer' } }}>
            <BsFiles onClick={e => setShowAllFiles(!showAllFiles)} />
          </IconContext.Provider>
        </div>

        {showAllFiles && <div style={{ width: '20%', display: 'flex', flexDirection: 'column', padding: '5px' }}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <span style={{ flexGrow: '1', fontWeight: '500' }}>All Files</span>
            <button style={{ alignSelf: 'end' }} onClick={onAddFileClick}>Create file</button>
          </div>
          <div>
            {files.map((file, ind) => (
              <div key={ind} style={curFile.name === file.name ?
                { display: 'flex', flexDirection: 'row', backgroundColor: 'lightblue', marginTop: '2px', flexGrow: '1' } :
                { display: 'flex', flexDirection: 'row', marginTop: '2px', }}>
                <div
                  onClick={e => onFileClick(e, file)}
                  style={{ flexGrow: '1' }}>
                  {file.icon}{" "}
                  {file.name}
                </div>
                <div style={{ display: 'inline', cursor: 'pointer', margin: '2px 0' }}>
                  <IconContext.Provider value={{ style: { float: 'right' } }}>
                    <BsTrash onClick={e => delFile(e, file)} />
                  </IconContext.Provider>
                </div>
              </div>
            ))}
            {showFileInput ? <input
              ref={inputRef}
              type="text"
              value={fileName}
              style={{ width: '100%' }}
              onChange={e => setFileName(e.currentTarget.value)}
              onKeyDown={addNewFile} /> : null}
            {
              files.length === 0 ? <span>Create a file and select it start using the editor</span> : null
            }
          </div>
        </div>}

        <div style={{ flexGrow: '1' }}>
          <textarea id="editor" cols="30" rows="60"></textarea>
        </div>
      </div>
    </div>
  )
}