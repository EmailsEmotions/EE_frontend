import { FormalityResult } from './interfaces/FormalityResult';
import { TextResult } from './interfaces/TextResult';

const Section = ['dashboard', 'history'];

let sectionManager: SectionManager;

class FormalityResultManager {
    private expanded = false;
    private el = null as HTMLDivElement;
    private result = null as FormalityResult;

    private formalityValue = null as number;
    private informalityValue = null as number;

    private formalityButton = null as HTMLButtonElement;
    private informalityButton = null as HTMLButtonElement;

    private loadingEl = null as HTMLDivElement;
    private errorEl = null as HTMLDivElement;
    private textareaEl = null as HTMLTextAreaElement;
    private resultsEl = null as HTMLDivElement;
    private evaluateEl = null as HTMLDivElement;

    constructor(result: FormalityResult) {
        this.result = result;
        this.el = this.build();
        this.getText();
    }

    public getEl() {
        return this.el;
    }

    private build() {
        const parent = document.createElement('div');
        parent.classList.add('history-post');

        {
            const header = document.createElement('div');
            header.addEventListener('click', () => {
                if (!this.expanded) {
                    this.expanded = true;
                    parent.setAttribute('name', 'expanded');
                } else {
                    this.expanded = false;
                    parent.removeAttribute('name');
                }
            });
            header.classList.add('history-post-header');
            parent.appendChild(header);

            let headerContainer = document.createElement('div');
            header.appendChild(headerContainer);

            const span = document.createElement('span');
            span.innerHTML = this.result.id.toString();
            headerContainer.appendChild(span);

            headerContainer = document.createElement('div');
            header.appendChild(headerContainer);

            const image = new Image();
            image.src = 'resources/main/arrow-down.svg';
            image.alt = 'Toggle expand';
            headerContainer.appendChild(image);
        }

        {
            const div = document.createElement('div')
            div.classList.add('history-post-content');
            parent.appendChild(div);

            const loading = document.createElement('div');
            this.loadingEl = loading;
            loading.classList.add('loading-container');
            loading.setAttribute('name', 'shown');
            div.appendChild(loading);

            const spinner = document.createElement('div');
            spinner.classList.add('loading');
            loading.appendChild(spinner);

            const error = document.createElement('div');
            this.errorEl = error;
            error.classList.add('error-container');
            div.appendChild(error);

            const textarea = document.createElement('textarea');
            this.textareaEl = textarea;
            textarea.style.display = 'none';
            textarea.readOnly = true;
            div.appendChild(textarea);

            {
                const res = document.createElement('div');
                res.classList.add('history-results');
                res.classList.add('history-results-formality');
                div.appendChild(res);
                this.resultsEl = res;

                const array = [
                    {
                        name: 'formality',
                        label: 'formal',
                    },
                    {
                        name: 'informality',
                        label: 'informal',
                    }
                ]

                for (const field of array) {
                    const col = document.createElement('div');
                    col.classList.add('history-results-col');
                    res.appendChild(col);

                    let container = document.createElement('div');
                    container.classList.add('history-results-col-text');
                    col.appendChild(container);

                    let text = document.createElement('span');
                    text.innerHTML = field.label;
                    container.appendChild(text);

                    container = document.createElement('div');
                    container.classList.add('history-results-col-text');
                    col.appendChild(container);

                    text = document.createElement('span');
                    const tmp = this.result as any;
                    text.innerHTML = `${tmp[field.name] * 100}%`;
                    container.appendChild(text);

                    container = document.createElement('div');
                    container.classList.add('history-results-col-review');
                    col.appendChild(container);

                    for (let i = 0; i < 10; i++) {
                        const value = i + 1;
                        const button = document.createElement('button');
                        button.innerHTML = value.toString();
                        button.addEventListener('click', () => {
                            (this as any)[`${field.name}Value`] = value;
                            
                            if ((this as any)[`${field.name}Button`] !== null) {
                                (this as any)[`${field.name}Button`].removeAttribute('name');
                            }

                            (this as any)[`${field.name}Button`] = button;
                            button.setAttribute('name', 'picked');
                        });

                        container.appendChild(button);
                    }
                }
            }

            {
                const evaluate = document.createElement('div');
                evaluate.classList.add('history-evaluation');
                div.appendChild(evaluate);
                this.evaluateEl = evaluate;

                const button = document.createElement('button');
                button.classList.add('btn');
                button.classList.add('btn-primary');
                button.innerHTML = 'Evaluate';
                button.addEventListener('click', () => {
                    this.sendEvaluation();
                });
                evaluate.appendChild(button);
            }
        }

        return parent;
    }

    getText() {
        const textId = this.result.textId;

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                this.loadingEl.removeAttribute('name');

                if (xhr.status == 200 || xhr.status == 201) {
                    try {
                        const results = JSON.parse(xhr.responseText) as TextResult;
                        this.textareaEl.value = results.text;
                        this.textareaEl.style.display = 'initial';
                        this.resultsEl.setAttribute('name', 'shown');
                        this.evaluateEl.setAttribute('name', 'shown');
                    } catch(e) {
                        this.setError(true, 'Unable to interpret server response');
                    }
                   
                } else if (xhr.status === 500) {
                    this.setError(true);
                } else {
                    this.setError(true, 'Unable to get formality results');
                }
            }
        });

        xhr.open('GET', `http://localhost:8080/api/formality/text/${textId}`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.send();
    }

    sendEvaluation() {
        if (this.formalityValue === null || this.informalityValue === null) {
            return;
        }

        const textId = this.result.textId;
        const userId = 1;

        const body = JSON.stringify({
            textId,
            userId,
            formality: this.formalityValue,
            informality: this.informalityValue,
        });

        this.textareaEl.style.display = 'none';
        this.resultsEl.removeAttribute('name');
        this.evaluateEl.removeAttribute('name');

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                this.loadingEl.removeAttribute('name');

                this.textareaEl.style.display = 'initial';
                this.resultsEl.setAttribute('name', 'shown');
                this.evaluateEl.setAttribute('name', 'shown');

                if (xhr.status == 200 || xhr.status == 201) {
                    this.evaluateEl.removeAttribute('name');
                } else if (xhr.status === 500) {
                    this.setError(true);
                } else {
                    this.setError(true, 'Unable to get formality results');
                }
            }
        });

        xhr.open('POST', `http://localhost:8080/api/formality/evaluate`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.send(body);
    }

    private setError(error: boolean, message: string = 'Unexpected error occured') {
        this.errorEl.innerHTML = message
        if (error) {
            this.errorEl.setAttribute('name', 'shown');
        } else {
            this.errorEl.removeAttribute('name');
        }
    }
}

class SectionManager {
    private currentSectionNo = null as number;

    constructor() {
        this.chooseSection(0);
    }

    public chooseSection(section: number) {
        if (this.currentSectionNo === section) {
            return;
        }

        if (this.currentSectionNo !== null) {
            document.getElementById(Section[this.currentSectionNo]).removeAttribute('name');
        }

        this.currentSectionNo = section;

        document.getElementById(Section[this.currentSectionNo]).setAttribute('name', 'shown');
    }
}

class DashboardSection {
    constructor() {
        this.appendListeners();
    }

    appendListeners() {
        document.getElementById('dashboard-tile-history').addEventListener('click', () => {
            sectionManager.chooseSection(1);
        });
    }
}

class HistorySection {
    constructor() {
        this.getResults();
    }

    getResults() {
        this.setLoading(true);
        const userId = 1;

        // Request
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                this.setLoading(false);

                if (xhr.status == 200 || xhr.status == 201) {
                    let results;
                    try {
                        results = JSON.parse(xhr.responseText) as FormalityResult[];
                    } catch(e) {
                        this.setError(true, 'Unable to interpret server response');
                    }

                    for (let result of results) {
                        const obj = new FormalityResultManager(result);
                        const el = obj.getEl();
                        document.getElementById('history-content-formality').appendChild(el);
                    }
                   
                } else if (xhr.status === 500) {
                    this.setError(true);
                } else {
                    this.setError(true, 'Unable to get formality results');
                }
            }
        });

        xhr.open('GET', `http://localhost:8080/api/formality/recognitions/${userId}`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.send();
    }

    setLoading(loading: boolean) {
        if (loading) {
            document.getElementById('history-loading').setAttribute('name', 'shown');
        } else {
            document.getElementById('history-loading').removeAttribute('name');
        }
    }

    setError(error: boolean, message: string = 'Unexpected error occured') {
        document.getElementById('history-error').innerHTML = message;

        if (error) {
            document.getElementById('history-error').setAttribute('name', 'shown');
        } else {
            document.getElementById('history-error').removeAttribute('name');
        }
    }
}

class Sidebar {
    constructor() {
        this.appendListeners();
    }

    appendListeners() {
        document.getElementById('sidebar-post-dashboard').addEventListener('click', () => {
            sectionManager.chooseSection(0);
        });

        document.getElementById('sidebar-post-history').addEventListener('click', () => {
            sectionManager.chooseSection(1);
        });
    }
}

window.onload = () => {
    new DashboardSection();
    new HistorySection();
    new Sidebar();

    sectionManager = new SectionManager();
    sectionManager.chooseSection(1);
}