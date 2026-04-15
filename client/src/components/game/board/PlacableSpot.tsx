import './PlacableSpot.scss'

function PlacableSpot({ color }: { color: string }) {
    return (
        <div className={`placable-spot ${color}`}>
            +
        </div>
    )
}

export default PlacableSpot