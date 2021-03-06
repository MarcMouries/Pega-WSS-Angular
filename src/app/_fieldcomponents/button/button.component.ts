import { Component, OnInit, Input } from '@angular/core';
import { HandleActions } from "../../_actions/handleactions";
import { FormGroup } from '../../../../node_modules/@angular/forms';
import { GetActionsService } from '../../_messages/getactions.service';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  @Input() fieldComp: any;
  @Input() formGroup: FormGroup;
  @Input() noLabel: boolean;
  @Input() CaseID: string;

  buttonLabel$: string;
  buttonFormat$: string = "";
  buttonColor$: string = "primary";
  showLabel$: boolean = false;

  actionsHandler: HandleActions;

  constructor(private gaservice: GetActionsService) { 

    this.actionsHandler = new HandleActions(gaservice);

  }

  ngOnInit() {

    if (this.noLabel) {
      this.fieldComp.label = "";
      this.showLabel$ = false;
    }
    else {
      if (this.fieldComp.label != "" && this.fieldComp.showLabel) {
        this.showLabel$ = true;
      }
      else if (this.fieldComp.label == "" && this.fieldComp.showLabel && this.fieldComp.labelReserveSpace) {
        this.showLabel$ = true;
      }
    }

    this.buttonLabel$ = this.fieldComp.control.label.replace( /\"/gi, "");

    let bFormat = this.fieldComp.control.modes[1].controlFormat;

    switch (bFormat.toUpperCase()) {
      case "STRONG" :
        this.buttonFormat$ = "pega-button-strong";
        break;
      case "STANDARD" :
      case "PZHC" :
        this.buttonFormat$ = "pega-button-standard";
        break;
      case "LIGHT" :
        this.buttonFormat$ = "pega-button-light";
        break;
        
      case "RED" :
      case "WARN" :
        this.buttonColor$ = "warn";
        break;
      case "BASIC" :
        this.buttonColor$ = "basic";
        break;
      case "ACCENT" :
        this.buttonColor$ = "basic";
        break;

    }
  }

  buttonClick(e) {
    this.actionsHandler.generateActions("click", this.fieldComp.control.actionSets, this.CaseID);
  }

}
