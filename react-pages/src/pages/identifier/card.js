// Generated by CoffeeScript 2.1.0
import React, {
  Component
} from 'react';

import {} from 'react-bootstrap';

export var MCProConsoleIdentifierCard = class MCProConsoleIdentifierCard extends Component {
  render() {
    var id;
    id = this.props.id;
    if (!id) {
      return null;
    }
    return <a href={"https://mycard.moe/ygopro/arena/index.html?id=" + id.toString() + "#/cardinfo"}>
            <img src={"http://ygo233.my-card.in/ygopro/pics/" + id.toString() + ".jpg!thumb"} alt="" target='_blank'></img>
        </a>;
  }

};

MCProConsoleIdentifierCard.defaultProps = {
  id: 0
};

export default MCProConsoleIdentifierCard;

//# sourceMappingURL=card.js.map
