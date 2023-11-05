import './style.css'
import { setupReport } from './report.ts'
// document.querySelector<HTMLDivElement>('#app')!.innerHTML = ""
setupReport(document.querySelector<HTMLButtonElement>('#form-button')!)
// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
