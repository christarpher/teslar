import React, { Component } from 'react';
import {store} from './store/index.js';
import { connect } from 'react-redux';
import axios from 'axios';

class ConfirmationPrompt extends Component{
  constructor(props) {
    super(props);
    this.state = {
      localOptions: {}
    };
    this.hideConfirmationModal = this.hideConfirmationModal.bind(this);
    this.refreshGlobalTimerWhenAction = this.refreshGlobalTimerWhenAction.bind(this);
    this.handleCommand = this.handleCommand.bind(this);
    this.showError = this.showError.bind(this);
  }
  
  componentDidMount(){
    this.setState({ 
      localOptions: this.props.localOptionsProp
    });
  }
  
  showError(text){
    store.dispatch({
      type: 'UPDATE_OBJECT',
      payload: {
        showErrorPrompt: true,
        showConfirmationPrompt: false,
        errorText: text
      }
    })
  }

  refreshGlobalTimerWhenAction(){
    var newStore = store.getState();
    if(newStore.state.localOptions.authToken !== "faketoken"){
      newStore.state.refreshTime = this.props.globalTimerInterval;
      store.dispatch({
        type: 'UPDATE_OBJECT',
        payload: {
          refreshTime: newStore.state.refreshTime
        }
      })
    }
  }

  //calling this when we press the X at the top
  closeConfirmationModal = () => {
    store.dispatch({
      type: 'UPDATE_OBJECT',
      payload: {
        showConfirmationPrompt: false,
        confirmationPromptFrunk: false,
        confirmationPromptTrunk: false,
        confirmationPromptLock: false,
        showControlModal: true,
        showMediaModal: false,
        showClimateModal: false,
        showChargingModal: false,
      }
    })
  }

  //calling this when a button to confirm is pressed
  hideConfirmationModal = () => {
    store.dispatch({
      type: 'UPDATE_OBJECT',
      payload: {
        showConfirmationPrompt: false,
        confirmationPromptFrunk: false,
        confirmationPromptTrunk: false,
        confirmationPromptLock: false,
        showControlModal: false,
        showMediaModal: false,
        showClimateModal: false,
        showChargingModal: false,
      }
    })
  }

  handleCommand = () => {
    //so the timer doesnt refresh directly after an async api call
    this.refreshGlobalTimerWhenAction();
    var self = this;
    //handle opening the frunk
    if(this.props.frunk === true && this.state.localOptions.authToken !== "faketoken"){
        axios.post('/openTrunk', {
            auth: JSON.stringify(this.state.localOptions),
            which: "frunk"
        })
        .then(function (response) {
        //if it's a good response, we dont need to do anything
          self.showError("Frunk has been opened!");
        })
        .catch(function (error) {
          self.showError("Error: Could not open the Frunk");
        });
    }else if(this.props.frunk === true && this.state.localOptions.authToken === "faketoken"){
      //self.showError("Frunk has been opened!");
    }

    //handle opening the trunk
    if(this.props.trunk === true && this.state.localOptions.authToken !== "faketoken"){
        axios.post('/openTrunk', {
            auth: JSON.stringify(this.state.localOptions),
            which: "trunk"
        })
        .then(function (response) {
            //if it's a good response, update local state
            self.showError("Trunk has been opened!");
        })
        .catch(function (error) {
          self.showError("Error: Could not open the Trunk");
        });
    }else if(this.props.trunk === true && this.state.localOptions.authToken === "faketoken"){
      //self.showError("Trunk has been opened!");
    }
    var newStore = store.getState();
    //handle locking or unlocking the car
    if(this.props.lock === true){
        if(this.props.vehicleLocked === true && this.state.localOptions.authToken !== "faketoken"){
            axios.post('/unlock', {
                auth: JSON.stringify(this.state.localOptions)
            })
            .then(function (response) {
                //if it's a good response, update local state
                newStore.state.vehicleDataObject.vehicle_state.locked = !newStore.state.vehicleDataObject.vehicle_state.locked;
                store.dispatch({
                    type: 'UPDATE_OBJECT',
                    payload: {
                    vehicleDataObject: newStore.state.vehicleDataObject
                    }
                })
            })
            .catch(function (error) {
              self.showError("Error: Could not unlock the vehicle");
            });
        }else if(this.props.vehicleLocked === true && this.state.localOptions.authToken === "faketoken"){
          newStore.state.vehicleDataObject.vehicle_state.locked = !newStore.state.vehicleDataObject.vehicle_state.locked;
            store.dispatch({
              type: 'UPDATE_OBJECT',
              payload: {
              vehicleDataObject: newStore.state.vehicleDataObject
              }
          })
        }
        if(this.props.vehicleLocked === false && this.state.localOptions.authToken !== "faketoken"){
            axios.post('/lock', {
                auth: JSON.stringify(this.state.localOptions)
            })
            .then(function (response) {
                //if it's a good response, update local state
                newStore.state.vehicleDataObject.vehicle_state.locked = !newStore.state.vehicleDataObject.vehicle_state.locked;
                store.dispatch({
                    type: 'UPDATE_OBJECT',
                    payload: {
                    vehicleDataObject: newStore.state.vehicleDataObject
                    }
                })
            })
            .catch(function (error) {
              self.showError("Error: Could not lock the vehicle");
            });
        }else if(this.props.vehicleLocked === false && this.state.localOptions.authToken === "faketoken"){
          newStore.state.vehicleDataObject.vehicle_state.locked = !newStore.state.vehicleDataObject.vehicle_state.locked;
            store.dispatch({
              type: 'UPDATE_OBJECT',
              payload: {
              vehicleDataObject: newStore.state.vehicleDataObject
              }
          })
        }
    }

    //hide (or close?) confirmation modal
    this.closeConfirmationModal();

  }


render(){
    return(
    <div>
        <Modal show={this.props.show} handleClose={this.hideConfirmationModal} >
            <div className="modal-content">
                <div className="modal--close">
                    <button id="modal--confirm_close" className="modal--close_button">
                        <i className="fas fa-times" onClick={this.closeConfirmationModal}></i>
                    </button>
                </div>
                <div className="modal--confirm_controls">
                    <p id="confirm--text">Are you sure you want to 
                        {this.props.frunk ? ' open the frunk?' : ''}
                        {this.props.trunk ? ' open the trunk?' : ''}
                        {this.props.lock ? this.props.vehicleLocked ? ' unlock the vehicle?' : ' lock the vehicle?' : ''}
                    </p>
                    <br />
                    <button id="confirm--make_confirmation" className="btn btn--modal_btn" onClick={this.handleCommand}>
                        {this.props.frunk ? 'Open Frunk' : ''}
                        {this.props.trunk ? 'Open Trunk' : ''}
                        {this.props.lock ? this.props.vehicleLocked ? 'Unlock Vehicle' : 'Lock Vehicle' : ''}
                    </button>
                </div>
            </div>
        </Modal>
    </div>
    );
  }
}

const Modal = ({ handleClose, show, children }) => {
    const showHideClassName = show ? 'block' : 'none';
      return (
        <div className='modal container--modal_confirm' style={{display: showHideClassName}}>
            {children}
        </div>
    );
};

const mapStateToProps = (state) => {
  return {
    localOptionsProp: state.state.localOptions,
    show: state.state.showConfirmationPrompt,
    frunk: state.state.confirmationPromptFrunk,
    trunk: state.state.confirmationPromptTrunk,
    lock: state.state.confirmationPromptLock,
    vehicleLocked: state.state.vehicleDataObject.vehicle_state.locked,
    globalTimerInterval: state.state.refreshInterval
  }
}

export default connect(mapStateToProps)(ConfirmationPrompt);