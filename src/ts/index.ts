import { FormalityResult } from './interfaces/FormalityResult';
import { EmotionsResult } from './interfaces/EmotionsResult';
import { FormalityResultManager } from './model/FormalityResultManager';
import { EmotionsResultManager } from './model/EmotionsResultManager';

const Section = ['dashboard', 'history'];

let user = {
  id: null as number,
  token: null as string,
};
let sectionManager: SectionManager;
let historySection: HistorySection;

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
      document
        .getElementById(Section[this.currentSectionNo])
        .removeAttribute('name');
    }

    this.currentSectionNo = section;

    document
      .getElementById(Section[this.currentSectionNo])
      .setAttribute('name', 'shown');
  }
}

class DashboardSection {
  constructor() {
    this.appendListeners();
  }

  appendListeners() {
    document
      .getElementById('dashboard-tile-history')
      .addEventListener('click', () => {
        sectionManager.chooseSection(1);
      });
  }
}

class HistorySection {
  private urlParamType = null as string;
  private urlParamId = null as number;

  constructor() {
    this.getFormalityResults();
    this.getEmotionsResults();
  }

  setUpReviewFromUrl(type: string, id: number) {
    this.urlParamType = type;
    this.urlParamId = id;
  }

  handleReviewFromUrl(
    type: string,
    el: FormalityResultManager | EmotionsResultManager
  ) {
    if (this.urlParamType !== null && this.urlParamId !== null) {
      if (type === this.urlParamType && el.getResult().id === this.urlParamId) {
        sectionManager.chooseSection(1);
        el.toggleExpand();
      }
    }
  }

  getFormalityResults() {
    this.setLoading(true);

    // Request
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === 4) {
        this.setLoading(false);

        if (xhr.status == 200 || xhr.status == 201) {
          let results;
          try {
            results = JSON.parse(xhr.responseText) as FormalityResult[];
          } catch (e) {
            this.setError(true, 'Unable to interpret server response');
          }

          for (let result of results) {
            const obj = new FormalityResultManager(result, user);
            const el = obj.getEl();
            this.handleReviewFromUrl('formality', obj);
            document
              .getElementById('history-content-formality')
              .appendChild(el);
          }
        } else if (xhr.status === 500) {
          this.setError(true);
        } else {
          this.setError(true, 'Unable to get formality results');
        }
      }
    });

    xhr.open(
      'GET',
      `http://localhost:8080/api/formality/recognitions/${user.id}`
    );
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', user.token);

    xhr.send();
  }

  getEmotionsResults() {
    this.setLoading(true);

    // Request
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === 4) {
        this.setLoading(false);

        if (xhr.status == 200 || xhr.status == 201) {
          let results;
          try {
            results = JSON.parse(xhr.responseText) as EmotionsResult[];
          } catch (e) {
            this.setError(true, 'Unable to interpret server response');
          }

          for (let result of results) {
            const obj = new EmotionsResultManager(result, user);
            const el = obj.getEl();
            this.handleReviewFromUrl('emotions', obj);
            document.getElementById('history-content-emotions').appendChild(el);
          }
        } else if (xhr.status === 500) {
          this.setError(true);
        } else {
          this.setError(true, 'Unable to get emotions results');
        }
      }
    });

    xhr.open(
      'GET',
      `http://localhost:8080/api/emotions/recognitions/${user.id}`
    );
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', user.token);

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
    document
      .getElementById('sidebar-post-dashboard')
      .addEventListener('click', () => {
        sectionManager.chooseSection(0);
      });

    document
      .getElementById('sidebar-post-history')
      .addEventListener('click', () => {
        sectionManager.chooseSection(1);
      });
  }
}

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const id = urlParams.get('id');
  user.id = parseInt(urlParams.get('userId'));
  user.token = urlParams.get('token');

  new DashboardSection();
  historySection = new HistorySection();
  new Sidebar();

  sectionManager = new SectionManager();

  if (type !== null && id !== null) {
    historySection.setUpReviewFromUrl(type, parseInt(id, 10));
  }
};
